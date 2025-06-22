import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import { CommandType, commandModule } from '@sern/handler';
import { requirePermission } from '../../../plugins/requirePermission.js';
import { publishConfig } from '@sern/publisher';

export default commandModule({
  name: 'delete-closed-threads',
  description: 'Delete all archived threads in a specific channel',
  type: CommandType.Slash,
  plugins: [
    requirePermission('user', [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: 'channel',
      description: 'The channel whose closed threads you want to delete',
      required: true,
    },
  ],

  async execute(ctx) {
    if (!ctx.guild) {
      return ctx.reply({
        content: 'This command must be run in a server.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const target = ctx.options.getChannel('channel', true);
    if (!(target instanceof TextChannel)) {
      return ctx.reply({
        content: 'Please specify a text channel.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // 1️⃣ Acknowledge immediately so we don't hit the 3s timeout:
    await ctx.interaction.deferReply({ flags: MessageFlags.Ephemeral});

    let deletedCount = 0;

    // 2️⃣ Fetch and delete up to 100 public archived threads:
    try {
      const { threads: publicThreads } = await target.threads.fetchArchived({
        limit: 100,
      });
      for (const thread of publicThreads.values()) {
        await thread.delete(`Cleanup by ${ctx.user.tag}`);
        deletedCount++;
      }
    } catch (err) {
      console.error('Error fetching public archived threads:', err);
    }

    // 3️⃣ (Optional) Fetch & delete private archived threads if your bot can:
    try {
      // This endpoint may differ by library version; adjust if needed.
      // @ts-ignore
      const { threads: privateThreads } = await target.threads.fetchArchived({
        limit: 100,
        type: 'private',
      });
      for (const thread of privateThreads.values()) {
        await thread.delete(`Cleanup (private) by ${ctx.user.tag}`);
        deletedCount++;
      }
    } catch {
      // ignore if no access or endpoint doesn’t exist
    }

    // 4️⃣ Send final summary
    return ctx.interaction.editReply(
      `🗑️ Deleted **${deletedCount}** archived thread(s) in ${target}.`
    );
  },
});