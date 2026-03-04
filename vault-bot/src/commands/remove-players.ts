import "dotenv/config";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { GuildMember, MessageFlags } from "discord.js";
import VaultPlayer from "../models/vaultPlayer.js";
import { updateLeaderboard } from "../utils/updateLeaderboard.js";

const HOST_ROLE_ID = process.env.HOST_ROLE_ID ?? "HOST_ROLE_ID_PLACEHOLDER";
const BANISHED_ROLE_ID = process.env.BANISHED_ROLE_ID ?? "BANISHED_ROLE_PLACEHOLDER";
const MURDERED_ROLE_ID = process.env.MURDERED_ROLE_ID ?? "MURDERED_ROLE_PLACEHOLDER";

export default commandModule({
  name: "remove-players",
  description: "Inactivate players who have been banished or murdered.",
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

    // Ensure member cache is complete
    await ctx.guild.members.fetch();

    const removedMembers = ctx.guild.members.cache.filter((m) =>
      m.roles.cache.has(BANISHED_ROLE_ID) ||
      m.roles.cache.has(MURDERED_ROLE_ID)
    );

    if (removedMembers.size === 0) {
      return ctx.interaction.editReply(
        "No members currently have the Banished or Murdered roles."
      );
    }

    const userIds = Array.from(removedMembers.values()).map((m) => m.id);

    const result = await VaultPlayer.updateMany(
      {
        guildId: ctx.guildId,
        userId: { $in: userIds },
      },
      {
        $set: { active: false },
      }
    );

    await updateLeaderboard(ctx.client, ctx.guildId!);


    return ctx.interaction.editReply(
      `${result.modifiedCount} player profile(s) set to inactive.`
    );
  },
});