import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "end-task",
  description: "End a task and allocate jewels to the three lands.",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    }),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "task",
      description: "Name of the task to end",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "agrabah",
      description: "Jewels for Agrabah",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "hundred_acre_wood",
      description: "Jewels for Hundred Acre Wood",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "monstropolis",
      description: "Jewels for Monstropolis",
      required: true,
    },
  ],

  execute: async (ctx) => {
    if (ctx.interaction.isAutocomplete()) return;
    // Defer reply publicly (not ephemeral) to allow longer execution
    await ctx.interaction.deferReply();
    const runID = ctx.interaction.id;
    try {
      // 1) Gather inputs
      const eventName = ctx.options.getString("task", true).toUpperCase();
      const inputs = [
        { name: "Agrabah", jewels: ctx.options.getNumber("agrabah", true) },
        {
          name: "Hundred Acre Wood",
          jewels: ctx.options.getNumber("hundred_acre_wood", true),
        },
        {
          name: "Monstropolis",
          jewels: ctx.options.getNumber("monstropolis", true),
        },
      ];

      // 2) Fetch all land docs in one query
      const landDocs = await landsSchema
        .find({ name: { $in: inputs.map((i) => i.name) } }, "name emojiID")
        .lean();
      const emojiMap = new Map<string, string>();
      landDocs.forEach((d) => emojiMap.set(d.name, d.emojiID ?? ""));

      // 3) Apply updates in a single bulk operation to reduce DB calls
      const bulkOps = inputs.map(({ name, jewels }) => ({
        updateOne: {
          filter: { name: name },
          update: { $inc: { totalPoints: jewels } },
        },
      }));
      await landsSchema.bulkWrite(bulkOps);

      // 4) Sort and build result string
      const sorted = [...inputs].sort((a, b) => b.jewels - a.jewels);
      let landOrder = "";
      sorted.forEach(({ name, jewels }) => {
        const emoji = emojiMap.get(name) || "";
        landOrder += `${name}: **${jewels}** ${emoji}\n`;
      });

      // 5) Log updates
      const actorMember = await ctx.guild!.members.fetch(ctx.user.id);
      const actor = actorMember.displayName;
      const logChannel = ctx.client.channels.cache.get(
        "1374744395563270205"
      ) as TextChannel | undefined;
      if (!logChannel || !logChannel.isTextBased()) {
        return await ctx.interaction.editReply({
          content: "⚠️ Log channel not found.",
        });
      }

      await logChannel.send(
        `<:v_russell:1375161867152130182> ${runID}: ${actor} has ended **${eventName}** and allocated jewels:\n${landOrder}`
      );

      // 6) Announce task end publicly
      const modChannel = ctx.client.channels.cache.get(
        "1220081937906008144"
      ) as TextChannel | undefined;
      if (!modChannel || !modChannel.isTextBased()) {
        return await ctx.interaction.editReply({
          content: "⚠️ Mod channel not found or not text-based.",
        });
      }
      modChannel.send(
        `<:v_russell:1375161867152130182> ${actor} has ended **${eventName}**`
      );

      const announceText = `**${eventName} TOTALS**\n${landOrder}\nCheck <#830617045741731910> for upcoming events!`;

      // 7) Edit deferred reply publicly
      return await ctx.interaction.editReply({
        content: announceText,
        allowedMentions: { parse: ["roles", "users"] },
      });
    } catch (err) {
      console.error("[end-task] error:", err);
      try {
        return await ctx.interaction.editReply({
          content: "⚠️ Something went wrong ending the task.",
        });
      } catch {}
    }
  },
});
