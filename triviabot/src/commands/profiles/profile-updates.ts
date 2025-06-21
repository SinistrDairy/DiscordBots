import { ApplicationCommandOptionType, PermissionFlagsBits, MessageFlags, TextChannel } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "update-profiles",
  description: "Update a user profile's land (normalized and validated)",
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
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "Which user to update?",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "land",
      description: "Name of the land to assign",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focused = ctx.options.getFocused() as string;
          const lands = await landsSchema.find({}, "name").lean();
          const choices = lands
            .map(l => l.name)
            .filter(n => n.toLowerCase().startsWith(focused.toLowerCase()))
            .slice(0, 25);
          await ctx.respond(
            choices.map(name => ({ name, value: name }))
          );
        },
      },
    },
  ],

  execute: async (ctx) => {
    const user = ctx.options.getUser("user", true);
    const landInput = ctx.options.getString("land", true);

    // Validate and normalize the land name (case-insensitive match)
    const landDoc = await landsSchema.findOne({
      name: { $regex: new RegExp(`^${landInput}$`, "i") },
    });
    if (!landDoc) {
      return ctx.reply({ content: `❌ Land "${landInput}" not found.`, flags: MessageFlags.Ephemeral });
    }
    const normalizedLand = landDoc.name.toLowerCase();

    // Update the user's profile
    const updated = await profileSchema.findOneAndUpdate(
      { userID: user.id },
      { $set: { land: normalizedLand } },
      { new: true }
    );
    if (!updated) {
      return ctx.reply({ content: `❌ No profile exists for ${user.tag}.`, flags: MessageFlags.Ephemeral });
    }

    // Log to a designated channel
    const logChannelId = "1374744395563270205";
    if (logChannelId) {
      const channel = ctx.client.channels.cache.get(logChannelId) as TextChannel;
      if (channel?.isTextBased()) {
        const changer = await ctx.guild!.members.fetch(ctx.user.id);
        await channel.send(
          `<:v_russell:1375161867152130182> ${changer.displayName} changed ${user.tag}'s land to **${normalizedLand}**.`
        );
      }
    }

    // Acknowledge success to the command issuer
    await ctx.reply({ content: `✅ Updated ${user.tag}'s land to **${normalizedLand}**.`, flags: MessageFlags.Ephemeral });
  },
});
