import "dotenv/config";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { GuildMember, MessageFlags } from "discord.js";
import VaultPlayer from "../models/vaultPlayer.js";

const HOST_ROLE_ID = process.env.HOST_ROLE_ID ?? "HOST_ROLE_ID_PLACEHOLDER";

export default commandModule({
  name: "reset-season",
  description: "Hard reset the season by removing all player profiles.",
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

    // Defer while deleting data
    await ctx.interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await VaultPlayer.deleteMany({
      guildId: ctx.guildId,
    });

    const removed = result.deletedCount ?? 0;

    return ctx.interaction.editReply(
      `☑️ Season reset complete.\n${removed} player profiles removed.`
    );
  },
});