// src/commands/submit.ts
import { CommandType, commandModule } from "@sern/handler";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  Message,
  PermissionFlagsBits,
} from "discord.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../plugins/requirePermission.js";
import Land from "../models/Land.js";

export default commandModule({
  name: "submit",
  description: "Distribute cow-post jewels × participants to each land",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!] as [
        `${number}`,
        `${number}`
      ],
    }),
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
  ],

  options: [
    {
      type: ApplicationCommandOptionType.Number,
      name: "agrabah",
      description: "Number of Agrabah participants",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "hundred_acre_wood",
      description: "Number of Hundred Acre Wood participants",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "monstropolis",
      description: "Number of Monstropolis participants",
      required: true,
    },
  ],
  execute: async (ctx) => {
    const thread = ctx.channel;
    if (!thread?.isThread())
      return ctx.reply({
        content: "Please run this in the cow-post thread.",
        flags: MessageFlags.Ephemeral,
      });

    let report = "";
    // 1) Attempt to fetch the starter message
    let embed;
    try {
      const starter = await thread.fetchStarterMessage();
      embed = starter?.embeds[0];
    } catch (err: any) {
      if (err.code !== 10008) throw err; // rethrow unexpected
      // Fallback: scan recent messages for the first bot embed
      const fetched = await thread.messages.fetch({ limit: 100 });
      const botMsg = fetched
        .filter(
          (m: Message) =>
            m.author.id === ctx.client.user!.id && m.embeds.length > 0
        )
        .first();
      embed = botMsg?.embeds[0];
    }

    if (!embed) {
      return ctx.reply({
        content: "Couldn’t find the cow-post embed in this thread.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 2) Extract jewels-per-post
    const raw = embed.fields[0]?.value ?? "";
    const m = raw.match(/worth __\*\*(\d+)\*\*__/i);
    if (!m) {
      return ctx.reply({
        content: "Could not parse jewels from the embed.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const jewelsPerPost = Number(m[1]);

    // 3) Read participant counts
    const counts: Record<string, number> = {
      Agrabah: ctx.options.getNumber("agrabah", true),
      "Hundred Acre Wood": ctx.options.getNumber("hundred_acre_wood", true),
      Monstropolis: ctx.options.getNumber("monstropolis", true),
    };

    type Result = { landName: string; total: number; emoji: string };
    const results: Result[] = [];

    // 4) Update lands
    for (const [landName, count] of Object.entries(counts)) {
      if (count <= 0) continue;

      const total = count * jewelsPerPost;

      const land = await Land.findOne({
        name: landName,
      });
      if (!land) {
        return await ctx.reply({
          content: `land: ${landName} not found.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await Land.updateOne(
        { name: landName },
        { $inc: { totalPoints: total } }
      );

      results.push({ landName, total, emoji: land.emojiID });
    }

    results.sort((a, b) => b.total - a.total);

    report = `\#\# <a:fk_sparkles:1073627951989534800> **${embed.title?.toUpperCase()} TOTALS** <a:fk_sparkles:1073627951989534800>\n\n`;
    for (const result of results) {
      const { landName, total, emoji } = result;
      report += `${landName}: ${total} ${emoji}\n`;
    }
    report += `\n-# Check out <#830617045741731910> for our weekly scheduled events to earn your land more jewels. We hope to see you there!`;

    return ctx.reply({ content: report });
  },
});

export const config = {
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
};
