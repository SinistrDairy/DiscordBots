import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
const LOG_CHANNEL_ID = "1374744395563270205";
const MOD_CHANNEL_ID = "1220081937906008144";
const EVENTS_CHANNEL_ID = "830617045741731910";
var end_task_default = commandModule({
  name: "end-task",
  description: "End a task and allocate jewels to participating lands.",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "task",
      description: "Name of the task to end",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "special_event",
      description: "Is this task for the special-event lands?",
      required: true
    }
  ],
  execute: async (ctx) => {
    if (ctx.interaction.isAutocomplete())
      return;
    const guild = ctx.guild;
    if (!guild) {
      return await ctx.interaction.reply({
        content: "\u26A0\uFE0F This command can only be used in a server.",
        ephemeral: true
      });
    }
    const eventName = ctx.options.getString("task", true).trim().toUpperCase();
    const isSpecialEvent = ctx.options.getBoolean(
      "special_event",
      true
    );
    if (!eventName) {
      return await ctx.interaction.reply({
        content: "\u26A0\uFE0F The task name cannot be empty.",
        ephemeral: true
      });
    }
    const modalCustomId = `end-task:${ctx.user.id}:${ctx.interaction.id}`;
    let submission = null;
    try {
      const lands = await landsSchema.find(
        {
          serverID: guild.id,
          special: isSpecialEvent
        },
        "name emojiID"
      ).sort({ name: 1 }).lean();
      if (lands.length === 0) {
        return await ctx.interaction.reply({
          content: isSpecialEvent ? "\u26A0\uFE0F No special-event lands were found." : "\u26A0\uFE0F No standard lands were found.",
          ephemeral: true
        });
      }
      if (lands.length > 5) {
        return await ctx.interaction.reply({
          content: `\u26A0\uFE0F ${lands.length} matching lands were found, but the form can only display five lands.`,
          ephemeral: true
        });
      }
      const modal = new ModalBuilder().setCustomId(modalCustomId).setTitle(
        isSpecialEvent ? "Special Event Land Totals" : "Standard Land Totals"
      );
      const rows = lands.map((land, index) => {
        const landName = String(land.name);
        const label = landName.length > 45 ? `${landName.slice(0, 42)}...` : landName;
        const input = new TextInputBuilder().setCustomId(`land_${index}`).setLabel(label).setPlaceholder("Enter jewel amount").setStyle(TextInputStyle.Short).setRequired(true).setMinLength(1).setMaxLength(10);
        return new ActionRowBuilder().addComponents(input);
      });
      modal.addComponents(...rows);
      await ctx.interaction.showModal(modal);
      try {
        submission = await ctx.interaction.awaitModalSubmit({
          time: 5 * 60 * 1e3,
          filter: (interaction) => interaction.customId === modalCustomId && interaction.user.id === ctx.user.id
        });
      } catch {
        return;
      }
      await submission.deferReply();
      const inputs = [];
      for (const [index, land] of lands.entries()) {
        const landName = String(land.name);
        const rawValue = submission.fields.getTextInputValue(`land_${index}`).trim();
        if (!/^\d+$/.test(rawValue)) {
          return await submission.editReply({
            content: `\u26A0\uFE0F The jewel amount for **${landName}** must be a whole number of zero or greater.`
          });
        }
        const jewels = Number(rawValue);
        if (!Number.isSafeInteger(jewels)) {
          return await submission.editReply({
            content: `\u26A0\uFE0F The jewel amount for **${landName}** is too large.`
          });
        }
        inputs.push({
          name: landName,
          emojiID: String(land.emojiID ?? ""),
          jewels
        });
      }
      const [logChannel, modChannel] = await Promise.all([
        ctx.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null),
        ctx.client.channels.fetch(MOD_CHANNEL_ID).catch(() => null)
      ]);
      if (!logChannel?.isSendable()) {
        return await submission.editReply({
          content: "\u26A0\uFE0F Log channel not found or cannot receive messages."
        });
      }
      if (!modChannel?.isSendable()) {
        return await submission.editReply({
          content: "\u26A0\uFE0F Mod channel not found or cannot receive messages."
        });
      }
      const actorMember = await guild.members.fetch(ctx.user.id);
      const actor = actorMember.displayName;
      const bulkResult = await landsSchema.bulkWrite(
        inputs.map(({ name, jewels }) => ({
          updateOne: {
            filter: {
              name,
              serverID: guild.id,
              special: isSpecialEvent
            },
            update: {
              $inc: {
                totalPoints: jewels
              }
            }
          }
        }))
      );
      if (bulkResult.matchedCount !== inputs.length) {
        console.error("[end-task] Land match count mismatch:", {
          expected: inputs.length,
          matched: bulkResult.matchedCount,
          eventName,
          serverID: guild.id,
          isSpecialEvent
        });
        return await submission.editReply({
          content: "\u26A0\uFE0F One or more lands could not be matched during the update. Check the database and bot logs."
        });
      }
      const landOrder = [...inputs].sort((a, b) => b.jewels - a.jewels).map(({ name, jewels, emojiID }) => {
        const emoji = emojiID ? ` ${emojiID}` : "";
        return `${name}: **${jewels}**${emoji}`;
      }).join("\n");
      const runID = submission.id;
      await logChannel.send({
        content: `<:v_russell:1375161867152130182> ${runID}: ${actor} has ended **${eventName}** and allocated jewels:
` + landOrder
      });
      await modChannel.send({
        content: `<:v_russell:1375161867152130182> ${actor} has ended **${eventName}**`
      });
      return await submission.editReply({
        content: `**${eventName} TOTALS**
${landOrder}

Check <#${EVENTS_CHANNEL_ID}> for upcoming events!`,
        allowedMentions: {
          parse: ["roles", "users"]
        }
      });
    } catch (error) {
      console.error("[end-task] error:", error);
      if (submission) {
        if (submission.deferred || submission.replied) {
          await submission.editReply({
            content: "\u26A0\uFE0F Something went wrong ending the task."
          }).catch(() => null);
        } else {
          await submission.reply({
            content: "\u26A0\uFE0F Something went wrong ending the task.",
            ephemeral: true
          }).catch(() => null);
        }
        return;
      }
      if (!ctx.interaction.replied && !ctx.interaction.deferred) {
        await ctx.interaction.reply({
          content: "\u26A0\uFE0F Something went wrong opening the task form.",
          ephemeral: true
        }).catch(() => null);
      }
    }
  }
});
export {
  end_task_default as default
};
