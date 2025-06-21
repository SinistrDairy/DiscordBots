import {
  ApplicationCommandOptionType,
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import { publishConfig } from "@sern/publisher";
import { PermissionFlagsBits } from "discord.js";
var edit_schedule_default = commandModule({
  name: "edit-schedule",
  description: "Remove an entry from the schedule or set a new weekly event.",
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
      name: "day",
      description: "Which day to remove the event from.",
      required: false,
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
      name: "weekly",
      description: "What would you like to change the weekly event to?",
      required: false
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "event",
      description: "Choose the event to remove.",
      required: false,
      autocomplete: true,
      command: {
        async execute(ctx) {
          try {
            const day = ctx.options.getString("day");
            if (!day) {
              return ctx.respond([]);
            }
            const dayMap = {
              monday: "mInfo",
              tuesday: "tInfo",
              wednesday: "wInfo",
              thursday: "thInfo",
              friday: "fInfo",
              saturday: "satInfo",
              sunday: "sunInfo"
            };
            const field = dayMap[day];
            if (!field)
              return ctx.respond([]);
            const schedule = await scheduleSchema.findOne({ isCurrent: true });
            if (!schedule || !Array.isArray(schedule[field])) {
              return ctx.respond([]);
            }
            const focusedValue = (ctx.options.getFocused()?.toString() ?? "").toLowerCase();
            const eventNames = schedule[field].map((entry) => entry.event).filter(
              (name) => name.toLowerCase().includes(focusedValue)
            ).filter((name, idx, arr) => arr.indexOf(name) === idx).slice(0, 25);
            const choices = eventNames.map((name) => ({
              name,
              value: name
            }));
            return ctx.respond(choices);
          } catch (error) {
            console.error("Autocomplete error:", error);
            return ctx.respond([]);
          }
        }
      }
    }
  ],
  execute: async (ctx) => {
    const day = ctx.options.getString("day", false);
    const eventToRemove = ctx.options.getString("event", false);
    const newWeekly = ctx.options.getString("weekly", false);
    const schedule = await scheduleSchema.findOne({ isCurrent: true });
    if (!schedule) {
      return ctx.reply({
        content: "<:x_russell:1375156566407381044> No active schedule found.",
        flags: MessageFlags.Ephemeral
      });
    }
    if (newWeekly && !day && !eventToRemove) {
      schedule.wEvent = newWeekly;
      await schedule.save();
      return ctx.reply({
        content: `\u2705 Weekly event updated to **${newWeekly}**.`,
        flags: MessageFlags.Ephemeral
      });
    }
    if (!day || !eventToRemove) {
      return ctx.reply({
        content: "<:x_russell:1375156566407381044> You must specify both a day and an event to remove, or use 'weekly' alone to change the weekly event.",
        flags: MessageFlags.Ephemeral
      });
    }
    const dayMap = {
      monday: "mInfo",
      tuesday: "tInfo",
      wednesday: "wInfo",
      thursday: "thInfo",
      friday: "fInfo",
      saturday: "satInfo",
      sunday: "sunInfo"
    };
    const field = dayMap[day];
    if (!field || !Array.isArray(schedule[field])) {
      return ctx.reply({
        content: `<:x_russell:1375156566407381044> Invalid day "${day}". Choose a day from Monday to Sunday.`,
        flags: MessageFlags.Ephemeral
      });
    }
    const originalLength = schedule[field].length;
    schedule[field] = schedule[field].filter(
      (entry) => entry.event !== eventToRemove
    );
    const updatedLength = schedule[field].length;
    if (originalLength === updatedLength) {
      return ctx.reply({
        content: `<:x_russell:1375156566407381044> No entries found for **${eventToRemove}** on **${day.charAt(0).toUpperCase() + day.slice(1)}**.`,
        flags: MessageFlags.Ephemeral
      });
    }
    await schedule.save();
    if (newWeekly) {
      schedule.wEvent = newWeekly;
      await schedule.save();
    }
    const convertTo24Hour = (time) => {
      const [hm, period] = time.split(" ");
      let [hour, minute] = hm.split(":").map((n) => parseInt(n, 10));
      if (period.toLowerCase() === "pm" && hour !== 12)
        hour += 12;
      if (period.toLowerCase() === "am" && hour === 12)
        hour = 0;
      return hour * 60 + minute;
    };
    const formatDay = (label, entries) => {
      if (!Array.isArray(entries) || entries.length === 0) {
        return `__**${label}:**__
 *(none)*
`;
      }
      const valid = entries.filter(
        (e) => e.name && e.event && e.time && e.emojiID
      );
      if (valid.length === 0) {
        return `__**${label}:**__
 *(none)*
`;
      }
      const sorted = valid.sort(
        (a, b) => convertTo24Hour(a.time) - convertTo24Hour(b.time)
      );
      return `__**${label}:**__
${sorted.map((e) => `${e.emojiID} ${e.name} @ ${e.time}`).join("\n")}`;
    };
    const isActive = schedule.isCurrent ? "<:v_russell:1375161867152130182>" : "<:x_russell:1375156566407381044>";
    const displaySchedule = `
### \u{1F5D3}\uFE0F Weekly Schedule: **${schedule.title}**
**Active Status: ${isActive}**

<:fk_dot:1334970932657131560> This week's special event is: **${schedule.wEvent}**

${formatDay("Member's Only Monday", schedule.mInfo)}
${formatDay("Tuesday", schedule.tInfo)}
${formatDay("Wednesday", schedule.wInfo)}
${formatDay("Thursday", schedule.thInfo)}
${formatDay("Friday", schedule.fInfo)}
${formatDay("Saturday", schedule.satInfo)}
${formatDay("Sunday", schedule.sunInfo)}
    `;
    const displayName = (await ctx.guild?.members.fetch(ctx.user.id))?.nickname ?? ctx.user.username;
    const logChannel = ctx.client.channels.cache.get("1374744395563270205");
    if (logChannel && logChannel.isTextBased()) {
      logChannel.send(
        `<:v_russell:1375161867152130182> ${displayName} removed **${eventToRemove}** from **${day.charAt(0).toUpperCase() + day.slice(1)}**.`
      );
    }
    return ctx.reply({ content: displaySchedule });
  }
});
export {
  edit_schedule_default as default
};
