import {
  PermissionFlagsBits,
  PermissionsBitField,
  orderedList,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import userSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "leaderboard",
  description: "Use this command to check the leaderboard!",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    }),
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }

    //#region let vars
    let leaderboard = ``;
    let triviaOrder = ``;
    let list = [];
    let landEmoji;
    let tTotals = 0;
    let pTotals = 0;
    let totals = 0;
    //#endregion

    //#region const vars
    const users = await userSchema.find({});

    if (users) {
      for (const results of users) {
        const { userID, land, nickName } = results;
        const landName = land
          .split(" ")
          .map((word: any) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(" ");
        const user = await userSchema.findOne({ userID: userID });
        //console.log(`${nickName}, ${land}`)
        if (user) {
          for (const event of user.events) {
            const { name, firsts = 0, seconds = 0, thirds = 0 } = event;
            if (name === "trivia") {
              tTotals = firsts + seconds + thirds;
            }
            if (name === "pop quiz") {
              pTotals = firsts + seconds + thirds;
            }
            totals = tTotals + pTotals;
          }

          const lProfile = await landsSchema.findOne({ name: landName });
          landEmoji = lProfile.emojiID;
          list.push({ userID, totals, landEmoji });
        }
      }
    }
    const sortedList = list.sort((a, b) => b.totals - a.totals).slice(0, 20);
    for (let counter = 0; counter < sortedList.length; ++counter) {
      const { userID, totals, landEmoji } = sortedList[counter];
      triviaOrder += `${counter + 1}.) <@${userID}> with **${totals}** ${landEmoji}\n`;
    }

    leaderboard = `
        \#\#\# __LEADERBOARD__\n${triviaOrder}\n
      `;

    //#endregion

    ctx.reply({
      content: leaderboard,
      allowedMentions: { parse: ["roles", "users"] },
    });
  },
});