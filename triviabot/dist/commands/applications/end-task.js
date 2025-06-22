import {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var end_task_default = commandModule({
  name: "end-task",
  description: "End a task and allocate jewels to the three lands.",
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
      type: ApplicationCommandOptionType.Number,
      name: "agrabah",
      description: "Jewels for Agrabah",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "hundred_acre_wood",
      description: "Jewels for Hundred Acre Wood",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "monstropolis",
      description: "Jewels for Monstropolis",
      required: true
    }
  ],
  execute: async (ctx) => {
    if (ctx.interaction.isAutocomplete())
      return;
    await ctx.interaction.deferReply();
    const runID = ctx.interaction.id;
    try {
      const eventName = ctx.options.getString("task", true).toUpperCase();
      const inputs = [
        { name: "Agrabah", jewels: ctx.options.getNumber("agrabah", true) },
        {
          name: "Hundred Acre Wood",
          jewels: ctx.options.getNumber("hundred_acre_wood", true)
        },
        {
          name: "Monstropolis",
          jewels: ctx.options.getNumber("monstropolis", true)
        }
      ];
      const landDocs = await landsSchema.find({ name: { $in: inputs.map((i) => i.name) } }, "name emojiID").lean();
      const emojiMap = /* @__PURE__ */ new Map();
      landDocs.forEach((d) => emojiMap.set(d.name, d.emojiID ?? ""));
      const bulkOps = inputs.map(({ name, jewels }) => ({
        updateOne: {
          filter: { name },
          update: { $inc: { totalPoints: jewels } }
        }
      }));
      await landsSchema.bulkWrite(bulkOps);
      const sorted = [...inputs].sort((a, b) => b.jewels - a.jewels);
      let landOrder = "";
      sorted.forEach(({ name, jewels }) => {
        const emoji = emojiMap.get(name) || "";
        landOrder += `${name}: **${jewels}** ${emoji}
`;
      });
      const actorMember = await ctx.guild.members.fetch(ctx.user.id);
      const actor = actorMember.displayName;
      const logChannel = ctx.client.channels.cache.get(
        "1374744395563270205"
      );
      if (!logChannel || !logChannel.isTextBased()) {
        return await ctx.interaction.editReply({
          content: "\u26A0\uFE0F Log channel not found."
        });
      }
      await logChannel.send(
        `<:v_russell:1375161867152130182> ${runID}: ${actor} has ended **${eventName}** and allocated jewels:
${landOrder}`
      );
      const modChannel = ctx.client.channels.cache.get(
        "1220081937906008144"
      );
      if (!modChannel || !modChannel.isTextBased()) {
        return await ctx.interaction.editReply({
          content: "\u26A0\uFE0F Mod channel not found or not text-based."
        });
      }
      modChannel.send(
        `<:v_russell:1375161867152130182> ${actor} has ended **${eventName}**`
      );
      const announceText = `**${eventName} TOTALS**
${landOrder}
Check <#830617045741731910> for upcoming events!`;
      return await ctx.interaction.editReply({
        content: announceText,
        allowedMentions: { parse: ["roles", "users"] }
      });
    } catch (err) {
      console.error("[end-task] error:", err);
      try {
        return await ctx.interaction.editReply({
          content: "\u26A0\uFE0F Something went wrong ending the task."
        });
      } catch {
      }
    }
  }
});
export {
  end_task_default as default
};
