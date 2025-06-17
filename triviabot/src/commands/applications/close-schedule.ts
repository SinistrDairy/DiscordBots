import { ApplicationCommandOptionType, PermissionFlagsBits, PermissionsBitField, TextChannel } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "close-schedule",
  description: "Use this command to close an open schedule",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    }),
  ],
    

  execute: async (ctx) => {

    const schedule = await scheduleSchema.findOne({isCurrent: true})
    if(!schedule){
       return await ctx.reply('<:x_russell:1375156566407381044> There are no currently active schedules.')
    }

    schedule.isCurrent = false;
    schedule.closedOn = new Date();
    schedule.save()   

    type ScheduleEntry = {
      name: string;
      id: string;
      event: string;
      time: string;
      emojiID: string;
    };
    let formattedTime;

    if(schedule.closedOn){
      formattedTime = schedule.closedOn.toLocaleString('en-US', {timeZone: 'America/New_York',dateStyle: 'long', timeStyle: 'short'});
    }
    

    const formatDay = (label: string, entries?: ScheduleEntry[]) => {
      if (!Array.isArray(entries) || entries.length === 0) {
        return `__**${label}:**__\n *(none)*\n`;
      }

      const valid = entries.filter(
        (e) => e && e.name && e.event && e.time && e.emojiID
      );

      if (valid.length === 0) return `__**${label}:**__\n *(none)*\n`;

      // Sort by time
      const sorted = valid.sort((a, b) => {
        const convertTo24Hour = (time: string) => {
          const [hm, period] = time.split(' ');
          let [hour, minute] = hm.split(':').map(Number);
          if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
          if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
          return hour * 60 + minute; // total minutes since midnight
        };

        return convertTo24Hour(a.time) - convertTo24Hour(b.time);
      });

      return `__**${label}:**__\n${sorted
        .map((e) => `${e.emojiID} ${e.name} @ ${e.time}`)
        .join('\n')}`;
    };

    let isActive;

    if(schedule.isCurrent === true){
      isActive = '<:v_russell:1375161867152130182>'
    }else{
      isActive = '<:x_russell:1375156566407381044>'
    }

    const displaySchedule = `
### 🗓️ Weekly Schedule: **${schedule.title}**
**Active Status: ${isActive}**

**This schedule was closed ${formattedTime}(EST)**
<:fk_dot:1334970932657131560> This week's special event is: **${schedule.wEvent}**

${formatDay(`Member's Only Monday`, schedule.mInfo)}

${formatDay(`Tuesday`, schedule.tInfo)}

${formatDay(`Wednesday`, schedule.wInfo)}

${formatDay(`Thursday`, schedule.thInfo)}

${formatDay(`Friday`, schedule.fInfo)}

${formatDay(`Saturday`, schedule.satInfo)}

${formatDay(`Sunday`, schedule.sunInfo)}
    `;

    const channel = ctx.client.channels.cache.get('1374744395563270205') as TextChannel
    channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild!.members.fetch(ctx.user.id)).nickname} has closed the ${schedule.title} schedule at ${formattedTime}(EST)`)

    return await ctx.reply(displaySchedule);

  },
});
