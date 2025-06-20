import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  EmbedBuilder,
  PermissionFlagsBits,
  ThreadChannel,
} from "discord.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { ThreadArchive } from "../../models/ThreadArchive.js";

const cowChannel = "1336737046282113097";

export default commandModule({
  type: CommandType.Slash,
  name: "active_threads",
  description:
    "List active threads created by this bot, with their jewel amounts and closing times.",
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
      name: "include_tests",
      description: "Include threads whose names contain 'test'?",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  async execute(ctx) {
    if (!ctx.guild) {
      return ctx.interaction.reply({
        content: "This command only works in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await ctx.interaction.deferReply();
    const includeTests = ctx.options.getBoolean("include_tests") ?? false;

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
      archives
        .filter((a) => includeTests || !/test/i.test(a.threadId))
        .map(async (a) => {
          const ch = (await ctx.guild!.channels.fetch(
            a.threadId
          )) as ThreadChannel;
          // fetch the starter message that triggered this thread
          const starter = await ch.fetchStarterMessage();
          let jewels = "N/A";
          if (starter && starter.embeds.length) {
            const embedMsg = starter.embeds[0];
            // Assume the first field contains the jewel info like '**50**'
            const field = embedMsg.fields[0];
            const match = field?.value.match(/\*\*(\d+)\*\*/);
            if (match) jewels = match[1];
          }
          return { id: a.threadId, archiveAt: a.archiveAt, jewels };
        })
    );

    // Build lines with jewel and close time
    const lines = threadInfos.map((info) => {
      const endTime = Math.floor(info.archiveAt.getTime() / 1000);
      return `<:fk_arrow_b:1335053427956514968> • <#${info.id}> • __**${info.jewels}**__ <:fk_jewelg:1333402405257351240> • closes <t:${endTime}:R>`;
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
      .setDescription(
        `-# <#${cowChannel}> - react below if you've completed each one!\n\n${openThreads}`
      );

    return ctx.interaction.editReply({ embeds: [embed] });
  },
});
