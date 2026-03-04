import "dotenv/config";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { GuildMember, MessageFlags } from "discord.js";
import VaultPlayer from "../models/vaultPlayer.js";
import { updateLeaderboard } from "../utils/updateLeaderboard.js"; // Adjust path as needed

const HOST_ROLE_ID = process.env.HOST_ROLE_ID ?? "HOST_ROLE_ID_PLACEHOLDER";
const PLAYER_ROLE_ID = process.env.PLAYER_ROLE_ID ?? "PLAYER_ROLE_ID_PLACEHOLDER";

export default commandModule({
  name: "register-players",
  description: "Create player profiles from the Player role (start of season).",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID!],
    }),
  ],

  execute: async (ctx) => {

    if (!ctx.guild) {
      return ctx.interaction.reply({
        content: "This command must be used inside a server.",
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

    // Defer reply while we process data
    await ctx.interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Check if season already active
    const existingProfiles = await VaultPlayer.exists({
      guildId: ctx.guildId,
    });

    if (existingProfiles) {
      return ctx.interaction.editReply(
        "Player profiles already exist. A season is currently active.\nRun `/season-reset` before registering players again."
      );
    }

    // Ensure full member cache
    await ctx.guild.members.fetch();

    const players = ctx.guild.members.cache.filter((m) =>
      m.roles.cache.has(PLAYER_ROLE_ID)
    );

    if (players.size === 0) {
      return ctx.interaction.editReply(
        "No members with the Player role were found."
      );
    }

    const docs = Array.from(players.values()).map((m) => ({
      guildId: ctx.guildId,
      userId: m.id,
      displayName: m.displayName,
      gold: 0,
      active: true,
    }));

    await VaultPlayer.insertMany(docs);
    await updateLeaderboard(ctx.client, ctx.guildId!);

    return ctx.interaction.editReply(
      `✅ ${docs.length} player profiles created. Season initialized.`
    );
  },
});