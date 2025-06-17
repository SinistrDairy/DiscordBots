import { ApplicationCommandOptionType, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import { publishConfig } from "@sern/publisher";

interface ScheduleEntry {
  name: string;
  id: string;
  event: string;
  time: string;
  emojiID: string;
}

/**
 * Format a schedule document into a Discord-friendly text block.
 */
function formatSchedule(schedule: any): string {
  const lines: string[] = [];
  const isActiveIcon = schedule.isCurrent
    ? "<:v_russell:1375161867152130182>"
    : "<:x_russell:1375156566407381044>";

  // Header
  lines.push(`### 🗓️ Weekly Schedule: **${schedule.title}**`);
  lines.push(`**Active Status: ${isActiveIcon}**`);

  // Closed date if exists
  if (schedule.closedOn) {
    const closedTime = new Date(schedule.closedOn).toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "long",
      timeStyle: "short",
    });
    lines.push(`**This schedule was closed ${closedTime} (EST)**`);
  }

  // Special event
  lines.push(
    `<:fk_dot:1334970932657131560> This week's special event is: **${
      schedule.wEvent || "None"
    }**`
  );
  lines.push("");

  // Helper to format each day
  const formatDay = (label: string, entries?: ScheduleEntry[]) => {
    const header = `__**${label}:**__`;
    if (!Array.isArray(entries) || entries.length === 0) {
      return `${header}\n*(none)*`;
    }
    const valid = entries.filter(
      (e) => e?.name && e.event && e.time && e.emojiID
    );
    if (valid.length === 0) {
      return `${header}\n*(none)*`;
    }
    const sorted = valid.sort((a, b) => {
      const toMins = (t: string) => {
        const [hm, period] = t.split(" ");
        let [h, m] = hm.split(":").map(Number);
        if (period.toLowerCase() === "pm" && h !== 12) h += 12;
        if (period.toLowerCase() === "am" && h === 12) h = 0;
        return h * 60 + m;
      };
      return toMins(a.time) - toMins(b.time);
    });
    const items = sorted.map((e) => `${e.emojiID} ${e.name} @ ${e.time}`);
    return `${header}\n${items.join("\n")}`;
  };

  // Append each day with spacing
  lines.push(formatDay("Member's Only Monday", schedule.mInfo));
  lines.push("");
  lines.push(formatDay("Tuesday", schedule.tInfo));
  lines.push("");
  lines.push(formatDay("Wednesday", schedule.wInfo));
  lines.push("");
  lines.push(formatDay("Thursday", schedule.thInfo));
  lines.push("");
  lines.push(formatDay("Friday", schedule.fInfo));
  lines.push("");
  lines.push(formatDay("Saturday", schedule.satInfo));
  lines.push("");
  lines.push(formatDay("Sunday", schedule.sunInfo));

  return lines.join("\n");
}

export default commandModule({
  name: "view-schedule",
  description: "View a specific schedule with autocomplete.",
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
      name: "schedule",
      description: "Select the schedule you'd like to view",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focused = ctx.options.getFocused() as string;
          const schedules = await scheduleSchema.find();
          const choices = schedules
            .map((s) => s.title)
            .filter((title) =>
              title.toLowerCase().startsWith(focused.toLowerCase())
            );
          await ctx.respond(
            choices.map((title) => ({ name: title, value: title }))
          );
        },
      },
    },
  ],

  execute: async (ctx) => {
    const title = ctx.options.getString("schedule", true);
    const schedule = await scheduleSchema.findOne({ title });
    if (!schedule) {
      return ctx.reply("<:x_russell:1375156566407381044> Schedule not found.");
    }
    const output = formatSchedule(schedule);
    return ctx.reply({ content: output });
  },
});
