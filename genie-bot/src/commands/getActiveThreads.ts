import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  EmbedBuilder,
  PermissionFlagsBits,
  ThreadChannel,
} from "discord.js";
import { requirePermission } from "../plugins/requirePermission.js";
import { ThreadArchive } from "../models/ThreadArchive.js";

const cowChannel = "1336737046282113097";

export default commandModule({
  type: CommandType.Slash,
  name: "view-cows",
  description: "List active cow threads.",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!] as [
        `${number}`,
        `${number}`
      ],
    }),
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
  ],

  async execute(ctx) {
    if (!ctx.guild) {
      return ctx.interaction.reply({
        content: "This command only works in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await ctx.interaction.deferReply();

    // Fetch active thread IDs
    const active = await ctx.guild.channels.fetchActiveThreads();
    const activeIds = active.threads.map((t) => t.id);

    // Load archives for threads created by this bot
    const archives = await ThreadArchive.find({
      threadId: { $in: activeIds },
      archived: false,
      endNotified: false,
    });
    if (!archives.length) {
      return ctx.interaction.followUp({
        content: "No active threads found created by this bot.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Prepare data: enrich with jewel count using the starter message
    const threadInfos = await Promise.all(
      archives.map(async (a) => {
        const ch = (await ctx.guild!.channels.fetch(
          a.threadId
        )) as ThreadChannel;
        const name = ch.name;
        return {
          id: a.threadId,
          name,
          archiveAt: a.archiveAt,
        };
      })
    );

    const realThreads = threadInfos.filter(
      (info) => !/test(ing)?/i.test(info.name)
    );

    // Build lines with jewel and close time
    const lines = realThreads.map((info) => {
      const endTime = Math.floor(info.archiveAt.getTime() / 1000);
      return `<:fk_arrow_b:1335053427956514968> • <#${info.id}> • closes <t:${endTime}:R>`;
    });
    const openThreads = lines.join("\n");

    // Format date
    const now = Date.now();
    const dateStr = new Date(now).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle(
        `<:geniePoint:1385315727816524097> Open Quest Posts - ${dateStr}`
      )
      .setColor("#52baff")
      .setDescription(
        `-# <#${cowChannel}> - react below if you've completed each one!\n\n${openThreads}`
      );

    return ctx.interaction.editReply({ embeds: [embed] });
  },
});
