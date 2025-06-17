import {ApplicationCommandOptionType, PermissionFlagsBits, PermissionsBitField} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "remove-event",
  description: `Use this command to remove an existing event.`,
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "event",
      description: `What is the name of the event you wish to delete?`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx: { options: { getFocused: () => any; }; respond: (arg0: { name: string; value: string; }[]) => any; }) => {
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
    const eventName = ctx.options.getString("event");

    const events = await eventSchema.find({});
    const eventList = events.map((event) => event.name);
    let flag = false;

    if (eventList.length === 0) {
      console.log(eventList, eventList.length, "no event found");
      ctx.reply(`No event found.`);
      return;
    }

    for (let counter = 0; counter < eventList.length; counter++) {
      const list = eventList[counter];
      console.log(list);

      if (eventName === list) {
        flag = true;
        break;
      } else {
        flag = false;
      }
    }

    if (flag === true) {
      await eventSchema.findOneAndDelete({
        name: eventName,
      });
      console.log("found event");
      ctx.reply(`${eventName} has been deleted from the list of events`);
    }
    if (flag === false) {
      console.log("no event");
      ctx.reply(`No event found.`);
    }
  },
});
