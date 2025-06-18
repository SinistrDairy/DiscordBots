import {
  PermissionFlagsBits
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import userSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var leaderboard_default = commandModule({
  name: "leaderboard",
  description: "Use this command to check the leaderboard!",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }
    let leaderboard = ``;
    let triviaOrder = ``;
    let list = [];
    let landEmoji;
    let tTotals = 0;
    let pTotals = 0;
    let totals = 0;
    const users = await userSchema.find({});
    if (users) {
      for (const results of users) {
        const { userID, land, nickName } = results;
        const landName = land.split(" ").map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(" ");
        const user = await userSchema.findOne({ userID });
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
      const { userID, totals: totals2, landEmoji: landEmoji2 } = sortedList[counter];
      triviaOrder += `${counter + 1}.) <@${userID}> with **${totals2}** ${landEmoji2}
`;
    }
    leaderboard = `
        ### __LEADERBOARD__
${triviaOrder}

      `;
    ctx.reply({
      content: leaderboard,
      allowedMentions: { parse: ["roles", "users"] }
    });
  }
});
export {
  leaderboard_default as default
};
