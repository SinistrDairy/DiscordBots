import {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { publishConfig } from "@sern/publisher";
import { suggestEvents } from "../../utils/suggestEvents.js";
var start_event_default = commandModule({
  name: "start-event",
  description: "Use this command to start your event!",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "event",
      description: `Select which event you're going to run`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: suggestEvents
      }
    }
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }
    const name = ctx.options.getString("event", true);
    const hostID = ctx.user.id;
    const event = await eventSchema.findOne({ name });
    if (event) {
      let { daRulez, tags, title, scoring, eEmojiID, rEmojiID, pointList } = event;
      let eventRules = ``;
      let rulesOrder = ``;
      let scoreList = ``;
      let scoreOrder = scoring ?? [];
      let pointOrder = pointList ?? [];
      const skipPhrase = "as follows:";
      tags = tags.replace(/,/g, " ");
      for (let counter = 0; counter < daRulez.length; ++counter) {
        const rulesList = daRulez[counter];
        rulesOrder += `${rEmojiID} ${rulesList}
`;
      }
      const len = Math.min(scoreOrder.length, pointOrder.length);
      const jewelEmoji = `<:fk_jewel:1333402533439475743>`;
      const dotEmoji = "<:fk_dot:1334970932657131560>";
      for (let i = 0, ptI = 0; i < len; ++i) {
        const desc = scoreOrder[i].trim();
        if (desc.endsWith(skipPhrase)) {
          scoreList += `${desc}
`;
          continue;
        }
        const points = pointOrder[ptI++]?.trim() ?? "0";
        scoreList += `${dotEmoji} ${desc}, __**${points}**__ ${jewelEmoji}
`;
      }
      eventRules += `  ### ${eEmojiID} ${title} ${eEmojiID}

            
### **__Rules__**

${rulesOrder}
### **__Scoring__**

${scoreList}
<a:magicjewels:859867893587509298> Your host for today's game is: <@${hostID}>!

${tags}`;
      ctx.reply({
        content: eventRules,
        allowedMentions: { parse: ["roles", "users"] }
      });
    } else {
      return "This event does not exist";
    }
  }
});
export {
  start_event_default as default
};
