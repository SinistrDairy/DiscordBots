import { PermissionFlagsBits, PermissionsBitField, TextChannel } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";


export default commandModule({
  name: "clear-profiles",
  description: "clear user profiles to start fresh.",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    }),
  ],
  execute: async (ctx) => {

    //#region add new document
    // const results = await profileSchema.find({});
    // for (const result of results) {
    //   const {
    //     userID,
    //     eventType,
    //     land,
    //     userName,
    //     nickName,
    //     totalPoints,
    //     serverID,
    //   } = result;
    //   await profileSchema.updateMany(
    //     {},
    //     {
    //       events: { name: "pop quiz", firsts: 0, seconds: 0, thirds: 0 },
    //     }
    //   );
    // }
    //#endregion

    //#region remove events from user profiles
    await profileSchema.updateMany({}, { $unset: { events: {} } });
    //#endregion

    //#region insert all events into user profiles and set all points to 0
      await profileSchema.updateMany(
        {},
        {
          $addToSet: {
            events: {
              $each: [
                { name: "trivia", firsts: 0, seconds: 0, thirds: 0 },
                { name: "pop quiz", firsts: 0, seconds: 0, thirds: 0 },
                { name: "misc", firsts: 0, seconds: 0, thirds: 0 },
              ],
            },
          },
          $set: {totalPoints: 0}
        },
        {}
      );

    //#endregion

    //#region insert one new event into user profiles
    // if (eventProfiles && profiles) {
    //   for (const results of eventProfiles) {
    //     const { name } = results;
    //     for(const result of profiles){
    //       const{userID, events, nickName } = result
    //       const found = await profileSchema.findOne({userID: userID}
    //       );
    //       if(found)
    //       {
    //         for(const newResults of found.events)
    //         {
    //           const {name} = newResults
    //         }
    //       }

    //     }
    // if(!found){
    //  await profileSchema.updateMany(
    //     {},{$push: {events: {name: name, firsts: 0, seconds: 0, thirds: 0}}},{}
    //   )
    // }
    //   }
    // }
    //#endregion

        const channel = ctx.client.channels.cache.get('1374744395563270205') as TextChannel
        channel.send(`${(await ctx.guild!.members.fetch(ctx.user.id)).nickname} has cleared user profiles and reset the leaderboard.`)
    
    await ctx.reply(`Set all member profile points to 0. Leaderboard has been reset.`);
  },
});
