import { ApplicationCommandOptionType, PermissionFlagsBits, MessageFlags } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
var profile_updates_default = commandModule({
  name: "update-profiles",
  description: "Update a user profile's land (normalized and validated)",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "Which user to update?",
      required: true
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
          const focused = ctx.options.getFocused();
          const lands = await landsSchema.find({}, "name").lean();
          const choices = lands.map((l) => l.name).filter((n) => n.toLowerCase().startsWith(focused.toLowerCase())).slice(0, 25);
          await ctx.respond(
            choices.map((name) => ({ name, value: name }))
          );
        }
      }
    }
  ],
  execute: async (ctx) => {
    const user = ctx.options.getUser("user", true);
    const landInput = ctx.options.getString("land", true);
    const landDoc = await landsSchema.findOne({
      name: { $regex: new RegExp(`^${landInput}$`, "i") }
    });
    if (!landDoc) {
      return ctx.reply({ content: `\u274C Land "${landInput}" not found.`, flags: MessageFlags.Ephemeral });
    }
    const normalizedLand = landDoc.name.toLowerCase();
    const updated = await profileSchema.findOneAndUpdate(
      { userID: user.id },
      { $set: { land: normalizedLand } },
      { new: true }
    );
    if (!updated) {
      return ctx.reply({ content: `\u274C No profile exists for ${user.tag}.`, flags: MessageFlags.Ephemeral });
    }
    const logChannelId = "1374744395563270205";
    if (logChannelId) {
      const channel = ctx.client.channels.cache.get(logChannelId);
      if (channel?.isTextBased()) {
        const changer = await ctx.guild.members.fetch(ctx.user.id);
        await channel.send(
          `<:v_russell:1375161867152130182> ${changer.displayName} changed ${user.tag}'s land to **${normalizedLand}**.`
        );
      }
    }
    await ctx.reply({ content: `\u2705 Updated ${user.tag}'s land to **${normalizedLand}**.`, flags: MessageFlags.Ephemeral });
  }
});
export {
  profile_updates_default as default
};
