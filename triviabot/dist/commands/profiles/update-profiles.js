import { PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
var update_profiles_default = commandModule({
  name: "clear-profiles",
  description: "clear user profiles to start fresh.",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    })
  ],
  execute: async (ctx) => {
    await profileSchema.updateMany({}, { $unset: { events: {} } });
    await profileSchema.updateMany(
      {},
      {
        $addToSet: {
          events: {
            $each: [
              { name: "trivia", firsts: 0, seconds: 0, thirds: 0 },
              { name: "pop quiz", firsts: 0, seconds: 0, thirds: 0 },
              { name: "misc", firsts: 0, seconds: 0, thirds: 0 }
            ]
          }
        },
        $set: { totalPoints: 0 }
      },
      {}
    );
    const channel = ctx.client.channels.cache.get("1374744395563270205");
    channel.send(`${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has cleared user profiles and reset the leaderboard.`);
    await ctx.reply(`Set all member profile points to 0. Leaderboard has been reset.`);
  }
});
export {
  update_profiles_default as default
};
