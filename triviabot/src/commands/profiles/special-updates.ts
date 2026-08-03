import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
  TextChannel,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "special-updates",
  description: "Batch-update users moving to a new land",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    }),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "new_land",
      description: "Land name to move users into",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focused = ctx.options.getFocused() as string;
          const lands = await landsSchema.find({}, "name").lean();
          const choices = lands
            .map((l) => l.name)
            .filter((name) =>
              name.toLowerCase().startsWith(focused.toLowerCase()),
            )
            .slice(0, 25)
            .map((name) => ({ name, value: name }));
          await ctx.respond(choices);
        },
      },
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: "transfer_role",
      description: "Role assigned to the users transferring to this land",
      required: true,
    },
  ],

  execute: async (ctx) => {
    const landInput = ctx.options.getString("new_land", true).trim().toLowerCase();
    const selectedRole = ctx.options.getRole("transfer_role", true);

    if (!ctx.guild) {
      return ctx.reply({
        content: "❌ This command can only be used inside a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await ctx.guild.members.fetch();
    const transferRole = await ctx.guild.roles.fetch(selectedRole.id);

    if (!transferRole) {
      return ctx.reply({
        content: `ℹ️ Transfer role not found.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const members = transferRole.members;

    if (members.size === 0) {
      return ctx.reply({
        content: `ℹ️ No users found with the role "${transferRole}" to update.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // Batch update all members' profiles
    const ids = Array.from(members.keys());
    const res = await profileSchema.updateMany(
      { userID: { $in: ids } },
      { $set: { land: landInput } },
    );

    // Announce in log channel
    const logId = "1374744395563270205";
    if (logId) {
      const ch = ctx.client.channels.cache.get(logId) as TextChannel;
      const changer = await ctx.guild!.members.fetch(ctx.user.id);
      const mention = selectedRole ? `<@&${selectedRole.id}> ` : "";
      await ch.send(
        `${mention}<:v_russell:1375161867152130182> ${changer.displayName} moved **${res.modifiedCount}** users to **${landInput}**.`,
      );
    }

    // Respond to issuer
    await ctx.reply({
      content: `✅ Updated **${res.modifiedCount}** profiles to land **${landInput}**.`,
      flags: MessageFlags.Ephemeral,
    });
  },
});
