import "dotenv/config";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { ApplicationCommand, ApplicationCommandOptionType, GuildMember, MessageFlags } from "discord.js";
import VaultPlayer from "../models/vaultPlayer.js";
import { updateLeaderboard } from "../utils/updateLeaderboard.js";

const HOST_ROLE_ID = process.env.HOST_ROLE_ID ?? "HOST_ROLE_PLACEHOLDER";

export default commandModule({
  name: "gold",
  description: "Manage player gold.",
  type: CommandType.Slash,

  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID!],
    }),
  ],

  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "add",
      description: "Add gold to a player",
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "player",
          description: "Player",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: "amount",
          description: "Gold amount",
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "subtract",
      description: "Subtract gold from a player",
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "player",
          description: "Player",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: "amount",
          description: "Gold amount",
          required: true,
        },
      ],
    },
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

    const sub = ctx.interaction.options.getSubcommand();

    const user = ctx.interaction.options.getUser("player", true);
    const amount = ctx.interaction.options.getInteger("amount", true);

    const guildMember = await ctx.guild.members.fetch(user.id);

    let delta = amount;

    if (sub === "subtract") {
      delta = -amount;
    }

    const result = await VaultPlayer.findOneAndUpdate(
      {
        guildId: ctx.guildId,
        userId: user.id,
        active: true,
      },
      {
        $inc: { gold: delta },
        $set: { displayName: guildMember.displayName },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return ctx.interaction.editReply(
        "Player profile not found or player is inactive."
      );
    }

    await updateLeaderboard(ctx.client, ctx.guildId!);

    return ctx.interaction.editReply(
      `${guildMember.displayName} now has ${result.gold} gold.`
    );
  },
  
});
