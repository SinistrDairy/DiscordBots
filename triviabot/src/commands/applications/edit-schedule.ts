import {
  ApplicationCommandOptionType,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import { publishConfig } from "@sern/publisher";
import { PermissionFlagsBits } from 'discord.js';

type ScheduleEntry = {
  name: string;
  id: string;
  event: string;
  time: string;
  emojiID: string;
};

export default commandModule({
  name: "edit-schedule",
  description: "Remove an entry from the schedule or set a new weekly event.",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    }),
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
        { name: "Sunday", value: "sunday" },
      ],
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "weekly",
      description: "What would you like to change the weekly event to?",
      required: false,
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
              sunday: "sunInfo",
            } as const;

            const field = dayMap[day as keyof typeof dayMap];
            if (!field) return ctx.respond([]);

            const schedule = await scheduleSchema.findOne({ isCurrent: true });
            if (!schedule || !Array.isArray(schedule[field])) {
              return ctx.respond([]);
            }

            const focusedValue = (
              ctx.options.getFocused()?.toString() ?? ""
            ).toLowerCase();

            const eventNames = schedule[field]
              .map((entry: ScheduleEntry) => entry.event)
              .filter((name: string) =>
                name.toLowerCase().includes(focusedValue)
              )
              .filter((name, idx, arr) => arr.indexOf(name) === idx)
              .slice(0, 25);

            const choices = eventNames.map((name: string) => ({
              name,
              value: name,
            }));
            return ctx.respond(choices);
          } catch (error) {
            console.error("Autocomplete error:", error);
            return ctx.respond([]);
          }
        },
      },
    },
  ],

  execute: async (ctx) => {
    const day = ctx.options.getString("day", false);
    const eventToRemove = ctx.options.getString("event", false);
    const newWeekly = ctx.options.getString("weekly", false);

    // 1) Fetch the active schedule
    const schedule = await scheduleSchema.findOne({ isCurrent: true });
    if (!schedule) {
      return ctx.reply({
        content: "<:x_russell:1375156566407381044> No active schedule found.",
        ephemeral: true,
      });
    }

    // 2) If only 'weekly' was provided (no day/event), update wEvent and return
    if (newWeekly && !day && !eventToRemove) {
      schedule.wEvent = newWeekly;
      await schedule.save();
      return ctx.reply({
        content: `✅ Weekly event updated to **${newWeekly}**.`,
        ephemeral: true,
      });
    }

    // 3) To remove an event, both 'day' and 'event' are required
    if (!day || !eventToRemove) {
      return ctx.reply({
        content:
          "<:x_russell:1375156566407381044> You must specify both a day and an event to remove, or use 'weekly' alone to change the weekly event.",
        ephemeral: true,
      });
    }

    // 4) Map day to schema field and validate
    const dayMap = {
      monday: "mInfo",
      tuesday: "tInfo",
      wednesday: "wInfo",
      thursday: "thInfo",
      friday: "fInfo",
      saturday: "satInfo",
      sunday: "sunInfo",
    } as const;

    const field = dayMap[day as keyof typeof dayMap];
    if (!field || !Array.isArray(schedule[field])) {
      return ctx.reply({
        content: `<:x_russell:1375156566407381044> Invalid day "${day}". Choose a day from Monday to Sunday.`,
        ephemeral: true,
      });
    }

    // 5) Remove the specified event
    const originalLength = schedule[field].length;
    schedule[field] = schedule[field].filter(
      (entry: ScheduleEntry) => entry.event !== eventToRemove
    );
    const updatedLength = schedule[field].length;

    if (originalLength === updatedLength) {
      return ctx.reply({
        content: `<:x_russell:1375156566407381044> No entries found for **${eventToRemove}** on **${
          day.charAt(0).toUpperCase() + day.slice(1)
        }**.`,
        ephemeral: true,
      });
    }

    await schedule.save();

    // 6) (Optional) If 'weekly' was sent alongside, update wEvent too
    if (newWeekly) {
      schedule.wEvent = newWeekly;
      await schedule.save();
    }

    // 7) Rebuild the display string
    const convertTo24Hour = (time: string) => {
      const [hm, period] = time.split(" ");
      let [hour, minute] = hm.split(":").map((n) => parseInt(n, 10));
      if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (period.toLowerCase() === "am" && hour === 12) hour = 0;
      return hour * 60 + minute;
    };

    const formatDay = (label: string, entries?: ScheduleEntry[]) => {
      if (!Array.isArray(entries) || entries.length === 0) {
        return `__**${label}:**__\n *(none)*\n`;
      }
      const valid = entries.filter(
        (e) => e.name && e.event && e.time && e.emojiID
      );
      if (valid.length === 0) {
        return `__**${label}:**__\n *(none)*\n`;
      }
      const sorted = valid.sort(
        (a, b) => convertTo24Hour(a.time) - convertTo24Hour(b.time)
      );
      return `__**${label}:**__\n${sorted
        .map((e) => `${e.emojiID} ${e.name} @ ${e.time}`)
        .join("\n")}`;
    };

    const isActive = schedule.isCurrent
      ? "<:v_russell:1375161867152130182>"
      : "<:x_russell:1375156566407381044>";

    const displaySchedule = `
### 🗓️ Weekly Schedule: **${schedule.title}**
**Active Status: ${isActive}**

<:fk_dot:1334970932657131560> This week's special event is: **${
      schedule.wEvent
    }**

${formatDay("Member's Only Monday", schedule.mInfo)}
${formatDay("Tuesday", schedule.tInfo)}
${formatDay("Wednesday", schedule.wInfo)}
${formatDay("Thursday", schedule.thInfo)}
${formatDay("Friday", schedule.fInfo)}
${formatDay("Saturday", schedule.satInfo)}
${formatDay("Sunday", schedule.sunInfo)}
    `;

    // 8) Log the removal (if event was actually removed)
    const displayName =
      (await ctx.guild?.members.fetch(ctx.user.id))?.nickname ??
      ctx.user.username;
    const logChannel = ctx.client.channels.cache.get("1374744395563270205") as
      | TextChannel
      | undefined;
    if (logChannel && logChannel.isTextBased()) {
      logChannel.send(
        `<:v_russell:1375161867152130182> ${displayName} removed **${eventToRemove}** from **${
          day.charAt(0).toUpperCase() + day.slice(1)
        }**.`
      );
    }

    // 9) Send the updated schedule to the command channel
    return ctx.reply({ content: displaySchedule });
  },
});
