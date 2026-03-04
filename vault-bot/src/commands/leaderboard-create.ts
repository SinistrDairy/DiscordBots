import "dotenv/config";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { GuildMember, MessageFlags, ChannelType } from "discord.js";
import VaultLeaderboard from "../models/vaultLeaderboard.js";
import { updateLeaderboard } from "../utils/updateLeaderboard.js";

const HOST_ROLE_ID = process.env.HOST_ROLE_ID ?? "HOST_ROLE_PLACEHOLDER";

export default commandModule({
  name: "leaderboard-create",
  description: "Create the leaderboard message.",
  type: CommandType.Slash,

  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID!],
    }),
  ],

  execute: async (ctx) => {

    if (!ctx.guild) {
      return ctx.interaction.reply({
        content: "This command must be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = ctx.member as GuildMember;

    if (!member.roles.cache.has(HOST_ROLE_ID)) {
      return ctx.interaction.reply({
        content: "Only Hosts can run this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await ctx.interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const existing = await VaultLeaderboard.findOne({
      guildId: ctx.guildId,
    });

    if (existing) {
      return ctx.interaction.editReply("Leaderboard already exists.");
    }

    if (!ctx.channel || !("send" in ctx.channel)) {
      return ctx.interaction.editReply("Unable to send message in this channel.");
    }

    const message = await ctx.channel.send("Leaderboard initializing...");

    await VaultLeaderboard.create({
      guildId: ctx.guildId!,
      channelId: ctx.channelId!,
      messageId: message.id,
    });

    await updateLeaderboard(ctx.client, ctx.guildId!);

    return ctx.interaction.editReply("Leaderboard created.");
  },
});