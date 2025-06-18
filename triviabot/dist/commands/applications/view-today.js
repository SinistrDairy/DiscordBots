import {
  PermissionFlagsBits
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import { publishConfig } from "@sern/publisher";
var view_today_default = commandModule({
  name: "todays-schedule",
  description: "Use this command to view todays scheduled events",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
  ],
  execute: async (ctx) => {
    const schedule = await scheduleSchema.findOne({ isCurrent: false, closedOn: { $ne: null } }).sort({ closedOn: -1 });
    if (!schedule) {
      return await ctx.reply(
        "<:x_russell:1375156566407381044> There are no currently closed schedules."
      );
    }
    const now = /* @__PURE__ */ new Date();
    const todayEST = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long"
    }).format(now);
    const dayFieldMap = {
      Monday: "mInfo",
      Tuesday: "tInfo",
      Wednesday: "wInfo",
      Thursday: "thInfo",
      Friday: "fInfo",
      Saturday: "satInfo",
      Sunday: "sunInfo"
    };
    const labelMap = {
      Monday: "Member's Only Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
      Thursday: "Thursday",
      Friday: "Friday",
      Saturday: "Saturday",
      Sunday: "Sunday"
    };
    const todayLabel = labelMap[todayEST];
    const todayField = dayFieldMap[todayEST];
    const entries = schedule[todayField];
    const formatDay = (label, entries2, showLabel = true) => {
      if (!Array.isArray(entries2) || entries2.length === 0) {
        return showLabel ? `__**${label}:**__
 *(none)*
` : "*(none)*\n";
      }
      const valid = entries2.filter(
        (e) => e && e.name && e.event && e.time && e.emojiID
      );
      if (valid.length === 0)
        return showLabel ? `__**${label}:**__
 *(none)*
` : "*(none)*\n";
      const sorted = valid.sort((a, b) => {
        const convertTo24Hour = (time) => {
          const [hm, period] = time.split(" ");
          let [hour, minute] = hm.split(":").map(Number);
          if (period.toLowerCase() === "pm" && hour !== 12)
            hour += 12;
          if (period.toLowerCase() === "am" && hour === 12)
            hour = 0;
          return hour * 60 + minute;
        };
        return convertTo24Hour(a.time) - convertTo24Hour(b.time);
      });
      const eventsList = sorted.map((e) => `${e.emojiID} <@${e.id}> @ ${e.time}`).join("\n");
      return showLabel ? `__**${label}:**__
${eventsList}` : eventsList;
    };
    const displayToday = `
<a:fk_astars_rainbow:1341583564755566603> __**GOOD MORNING ROYALS!**__ <a:fk_astars_rainbow:1341583564755566603>

Today is **${todayLabel}**!


Here is a list of our scheduled events for today:

${formatDay(todayLabel, entries, false)}
    `;
    return await ctx.reply(displayToday);
  }
});
export {
  view_today_default as default
};
