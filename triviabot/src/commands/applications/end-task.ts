import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  TextChannel,
  MessageFlags,
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
    // No autocomplete here
    if (ctx.interaction.isAutocomplete()) return;

    // Defer reply to extend time and keep ephemeral
    await ctx.interaction.deferReply({ flags: MessageFlags.Ephemeral });
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

      // 2) Update all lands in parallel
      await Promise.all(
        inputs.map(({ name, jewels }) =>
          landsSchema.findOneAndUpdate(
            { name },
            { $inc: { totalPoints: jewels } }
          )
        )
      );

      // 3) Fetch emojiIDs and sort descending
      const detailed = await Promise.all(
        inputs.map(async ({ name, jewels }) => {
          const land = await landsSchema.findOne({ name });
          return { name, jewels, emojiID: land?.emojiID ?? "" };
        })
      );
      detailed.sort((a, b) => b.jewels - a.jewels);

      // 4) Build results string and log per-land updates
      let landOrder = "";
      const member = await ctx.guild!.members.fetch(ctx.user.id);
      const actor = member.nickname ?? ctx.user.username;
      const logChan = ctx.client.channels.cache.get("1374744395563270205") as
        | TextChannel
        | undefined;

      for (const { name, jewels, emojiID } of detailed) {
        landOrder += `${name}: **${jewels}** ${emojiID}\n`;
        if (logChan?.isTextBased()) {
          await logChan.send(
            `<:v_russell:1375161867152130182> ${actor} added ${jewels} jewels to ${name}`
          );
        }
      }

      // 5) Announce task end in public channels
      const announce = `**${eventName} TOTALS**\n${landOrder}\nCheck <#830617045741731910> for upcoming events!`;
      const publicIds = ["1374744395563270205", "1220081937906008144"];
      for (const id of publicIds) {
        const ch = ctx.client.channels.cache.get(id) as TextChannel | undefined;
        if (ch?.isTextBased()) {
          await ch.send(
            `<:v_russell:1375161867152130182> ${actor} has ended ${eventName}`
          );
        }
      }

      // 6) Edit deferred reply with totals
      return await ctx.interaction.editReply({
        content: announce,
        allowedMentions: { parse: ["roles", "users"] },
      });
    } catch (err) {
      console.error("[end-task] error:", err);
      try {
        await ctx.reply({
          content: "⚠️ Something went wrong ending the task.",
          flags: MessageFlags.Ephemeral,
        });
      } catch {}
    }
  },
});
