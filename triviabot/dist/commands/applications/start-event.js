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
      let { daRulez, tags, title, scoring } = event;
      let eventRules = ``;
      let rulesOrder = ``;
      let scoreOrder = ``;
      tags = tags.replace(/,/g, " ");
      for (let counter = 0; counter < daRulez.length; ++counter) {
        const rulesList = daRulez[counter];
        rulesOrder += `${rulesList}
`;
      }
      for (let counter = 0; counter < scoring.length; ++counter) {
        const scoreList = scoring[counter];
        scoreOrder += `<:fk_dot:1334970932657131560> ${scoreList}
`;
      }
      eventRules += `  ### ${title}

            
### **__Rules__**

${rulesOrder}
### **__Scoring__**

${scoreOrder}
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
