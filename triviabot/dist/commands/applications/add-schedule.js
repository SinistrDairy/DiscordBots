import {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { publishConfig } from "@sern/publisher";
var add_schedule_default = commandModule({
  name: "add-to-schedule",
  description: "Use this command to add yourself to this week\u2019s schedule.",
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
      description: "Which event are you hosting?",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused();
          const events = await eventSchema.find({});
          const eventNames = events.map((e) => e.name);
          const filtered = eventNames.filter(
            (name) => name.toLowerCase().startsWith(focus.toLowerCase())
          );
          await ctx.respond(
            filtered.map((name) => ({ name, value: name }))
          );
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "day",
      description: "Which day are you hosting?",
      required: true,
      choices: [
        { name: "Monday", value: "monday" },
        { name: "Tuesday", value: "tuesday" },
        { name: "Wednesday", value: "wednesday" },
        { name: "Thursday", value: "thursday" },
        { name: "Friday", value: "friday" },
        { name: "Saturday", value: "saturday" },
        { name: "Sunday", value: "sunday" }
      ]
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "am-pm",
      description: "Choose AM or PM",
      required: true,
      choices: [
        { name: "AM", value: "am" },
        { name: "PM", value: "pm" }
      ]
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "hour",
      description: "Hour you\u2019re hosting (1-12)",
      required: true,
      choices: Array.from({ length: 12 }, (_, i) => ({
        name: `${i + 1}`,
        value: `${i + 1}`
      }))
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "minutes",
      description: "Optional minutes",
      required: false,
      choices: [
        { name: "00", value: "00" },
        { name: "15", value: "15" },
        { name: "30", value: "30" },
        { name: "45", value: "45" }
      ]
    }
  ],
  execute: async (ctx) => {
    const { user, options } = ctx;
    const eventName = options.getString("event", true);
    const day = options.getString("day", true);
    const ampm = options.getString("am-pm", true);
    const hour = options.getString("hour", true);
    const minutes = options.getString("minutes") ?? "00";
    const time = `${hour}:${minutes} ${ampm}`;
    const displayName = "nickname" in ctx.member && ctx.member.nickname ? ctx.member.nickname : user.username;
    const dayMap = {
      monday: "mInfo",
      tuesday: "tInfo",
      wednesday: "wInfo",
      thursday: "thInfo",
      friday: "fInfo",
      saturday: "satInfo",
      sunday: "sunInfo"
    };
    const schedule = await scheduleSchema.findOne({ isCurrent: true });
    if (!schedule) {
      return await ctx.reply("<:x_russell:1375156566407381044> No active schedule found.");
    }
    const event = await eventSchema.findOne({ name: eventName });
    if (!event) {
      return await ctx.reply("<:x_russell:1375156566407381044> That event doesn't exist.");
    }
    const emojiID = event.eEmojiID;
    const field = dayMap[day];
    const entries = schedule[field];
    const userEntry = {
      name: displayName,
      id: user.id,
      event: eventName,
      time,
      emojiID
    };
    const isDuplicate = entries.some(
      (e) => e?.id === user.id && e?.event === eventName && e?.event !== "trivia"
    );
    if (isDuplicate) {
      return await ctx.reply("<:x_russell:1375156566407381044> You\u2019re already scheduled for this event that day.");
    }
    const isTimeTaken = entries.some((e) => e?.time === time);
    if (isTimeTaken) {
      return await ctx.reply("<:x_russell:1375156566407381044> That time slot is already taken.");
    }
    entries.push(userEntry);
    await schedule.save();
    const formatDay = (label, entries2) => {
      if (!Array.isArray(entries2) || entries2.length === 0) {
        return `__**${label}:**__
 *(none)*
`;
      }
      const valid = entries2.filter(
        (e) => e && e.name && e.event && e.time && e.emojiID
      );
      if (valid.length === 0)
        return `__**${label}:**__
 *(none)*
`;
      const sorted = valid.sort((a, b) => {
        const convertTo24Hour = (time2) => {
          const [hm, period] = time2.split(" ");
          let [hour2, minute] = hm.split(":").map(Number);
          if (period.toLowerCase() === "pm" && hour2 !== 12)
            hour2 += 12;
          if (period.toLowerCase() === "am" && hour2 === 12)
            hour2 = 0;
          return hour2 * 60 + minute;
        };
        return convertTo24Hour(a.time) - convertTo24Hour(b.time);
      });
      return `__**${label}:**__
${sorted.map((e) => `${e.emojiID} ${e.name} @ ${e.time}`).join("\n")}`;
    };
    let isActive;
    if (schedule.isCurrent === true) {
      isActive = "<:v_russell:1375161867152130182>";
    } else {
      isActive = "<:x_russell:1375156566407381044>";
    }
    const displaySchedule = `
### \u{1F5D3}\uFE0F Weekly Schedule: **${schedule.title}**
**Active Status: ${isActive}**

<:fk_dot:1334970932657131560> This week's special event is: **${schedule.wEvent}**

${formatDay(`Member's Only Monday`, schedule.mInfo)}

${formatDay(`Tuesday`, schedule.tInfo)}

${formatDay(`Wednesday`, schedule.wInfo)}

${formatDay(`Thursday`, schedule.thInfo)}

${formatDay(`Friday`, schedule.fInfo)}

${formatDay(`Saturday`, schedule.satInfo)}

${formatDay(`Sunday`, schedule.sunInfo)}
    `;
    const channel = ctx.client.channels.cache.get("1374744395563270205");
    channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has been added to the ${schedule.title} schedule.`);
    return await ctx.reply(displaySchedule);
  }
});
export {
  add_schedule_default as default
};
