import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "start-event",
  description: "Use this command to start your event!",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    }),
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
        execute: async (ctx: {
          options: { getFocused: () => any };
          respond: (arg0: { name: string; value: string }[]) => any;
        }) => {
          const focus = ctx.options.getFocused();
          const events = await eventSchema.find({});
          const eventNames = [];
          for (const results of events) {
            eventNames.push(results.name);
            // console.log(results.name)
          }
          const filter = eventNames.filter((t) => t.startsWith(focus));
          await ctx.respond(
            filter.map((title) => ({ name: title, value: title }))
          );
        },
      },
    },
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
      // tags = `<@&1277672317576548413>   <@&1277672375248224357>`
      for (let counter = 0; counter < daRulez.length; ++counter) {
        const rulesList = daRulez[counter];
        rulesOrder += `${rulesList}\n`;
      }
      for (let counter = 0; counter < scoring.length; ++counter) {
        const scoreList = scoring[counter];
        scoreOrder += `<:fk_dot:1334970932657131560> ${scoreList}\n`;
      }

      eventRules += `  \#\#\# ${title}\n
            \n\#\#\# **__Rules__**\n\n${rulesOrder}\n\#\#\# **__Scoring__**\n\n${scoreOrder}\n<a:magicjewels:859867893587509298> Your host for today's game is: <@${hostID}>!\n\n${tags}`;

      ctx.reply({
        content: eventRules,
        allowedMentions: { parse: ["roles", "users"] },
      });
    } else {
      return "This event does not exist";
    }
  },
});
