import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var profile_updates_default = commandModule({
  name: "update-profiles",
  description: "Update a user profile for land changes.",
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
      description: `Which user?`,
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "land",
      description: `What is the name of the land?`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused(true);
          const lands = await landsSchema.find({});
          const landNames = [];
          for (const results of lands) {
            landNames.push(results.name);
          }
          const filter = landNames.filter(
            (t) => t.startsWith(focus.value.toLowerCase())
          );
          await ctx.respond(
            filter.map((title) => ({ name: title, value: title }))
          );
        }
      }
    }
  ],
  execute: async (ctx) => {
    const user = ctx.options.getUser("user", true);
    const land = ctx.options.getString("land", true);
    const profile = await profileSchema.find({ userID: user.id });
    if (profile) {
      await profileSchema.updateOne(
        { userID: user.id },
        {
          $set: { land }
        },
        {}
      );
    }
    const channel = ctx.client.channels.cache.get("1374744395563270205");
    channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has changed user ${user.globalName}'s land to ${land}.`);
    await ctx.reply(`<:v_russell:1375161867152130182> Success! You've changed user ${user.globalName}'s land to ${land}.`);
  }
});
export {
  profile_updates_default as default
};
