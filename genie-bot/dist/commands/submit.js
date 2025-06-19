import { CommandType, commandModule } from "@sern/handler";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../plugins/requirePermission.js";
import Land from "../models/Land.js";
var submit_default = commandModule({
  name: "submit",
  description: "Distribute cow-post jewels \xD7 participants to each land",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2]
    }),
    requirePermission("user", [PermissionFlagsBits.ManageMessages])
  ],
  options: [
    {
      type: ApplicationCommandOptionType.Number,
      name: "agrabah",
      description: "Number of Agrabah participants",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "hundred_acre_wood",
      description: "Number of Hundred Acre Wood participants",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "monstropolis",
      description: "Number of Monstropolis participants",
      required: true
    }
  ],
  execute: async (ctx) => {
    const thread = ctx.channel;
    if (!thread?.isThread())
      return ctx.reply({
        content: "Please run this in the cow-post thread.",
        flags: MessageFlags.Ephemeral
      });
    let report = "";
    let embed;
    try {
      const starter = await thread.fetchStarterMessage();
      embed = starter?.embeds[0];
    } catch (err) {
      if (err.code !== 10008)
        throw err;
      const fetched = await thread.messages.fetch({ limit: 100 });
      const botMsg = fetched.filter(
        (m2) => m2.author.id === ctx.client.user.id && m2.embeds.length > 0
      ).first();
      embed = botMsg?.embeds[0];
    }
    if (!embed) {
      return ctx.reply({
        content: "Couldn\u2019t find the cow-post embed in this thread.",
        flags: MessageFlags.Ephemeral
      });
    }
    const raw = embed.fields[0]?.value ?? "";
    const m = raw.match(/worth __\*\*(\d+)\*\*__/i);
    if (!m) {
      return ctx.reply({
        content: "Could not parse jewels from the embed.",
        flags: MessageFlags.Ephemeral
      });
    }
    const jewelsPerPost = Number(m[1]);
    const counts = {
      Agrabah: ctx.options.getNumber("agrabah", true),
      "Hundred Acre Wood": ctx.options.getNumber("hundred_acre_wood", true),
      Monstropolis: ctx.options.getNumber("monstropolis", true)
    };
    const results = [];
    for (const [landName, count] of Object.entries(counts)) {
      if (count <= 0)
        continue;
      const total = count * jewelsPerPost;
      const land = await Land.findOne({
        name: landName
      });
      if (!land) {
        return await ctx.reply({
          content: `land: ${landName} not found.`,
          flags: MessageFlags.Ephemeral
        });
      }
      await Land.updateOne(
        { name: landName },
        { $inc: { totalPoints: total } }
      );
      results.push({ landName, total, emoji: land.emojiID });
    }
    results.sort((a, b) => b.total - a.total);
    report = `## <a:fk_sparkles:1073627951989534800> **${embed.title?.toUpperCase()} TOTALS** <a:fk_sparkles:1073627951989534800>

`;
    for (const result of results) {
      const { landName, total, emoji } = result;
      report += `${landName}: ${total} ${emoji}
`;
    }
    report += `
-# Check out <#830617045741731910> for our weekly scheduled events to earn your land more jewels. We hope to see you there!`;
    return ctx.reply({ content: report });
  }
});
const config = {
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.ManageMessages]
};
export {
  config,
  submit_default as default
};
