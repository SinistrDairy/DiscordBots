import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import { publishConfig } from "@sern/publisher";
var start_schedule_default = commandModule({
  name: "start-schedule",
  description: "Use this command to start scheduling",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "month",
      description: `Select which month would you like to schedule for?`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused();
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
          ];
          const filter = months.filter((t) => t.startsWith(focus));
          await ctx.respond(filter.map((m) => ({ name: m, value: m })));
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "week-number",
      description: "Which week number would you like to schedule for?",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused();
          const weeks = ["One", "Two", "Three", "Four", "Five"];
          const filter = weeks.filter((t) => t.startsWith(focus));
          await ctx.respond(filter.map((n) => ({ name: n, value: n })));
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "weekly-event",
      description: "What is the weekly event?",
      required: true
    }
  ],
  execute: async (ctx) => {
    const month = ctx.options.getString("month", true);
    const week = ctx.options.getString("week-number", true);
    const weeklyEvent = ctx.options.getString("weekly-event", true);
    const title = `${month}, Week ${week}`;
    const roleID = "830604135748337676";
    const mention = `<@&${roleID}>`;
    let schedData;
    try {
      if (await scheduleSchema.exists({ title })) {
        return ctx.reply({
          content: `<:x_russell:1375156566407381044> A schedule titled **"${title}"** already exists.`,
          flags: MessageFlags.Ephemeral
        });
      }
      schedData = await scheduleSchema.create({
        title,
        wEvent: weeklyEvent,
        isCurrent: true
        // if your schema has day fields, they’ll default to null/empty
      });
    } catch (err) {
      console.error(err);
      return ctx.reply({
        content: `<:x_russell:1375156566407381044> Something went wrong creating that schedule.`,
        flags: MessageFlags.Ephemeral
      });
    }
    const statusIcon = schedData.isCurrent ? "<:v_russell:1375161867152130182>" : "<:x_russell:1375156566407381044>";
    const header = [
      `${mention}`,
      `### \u{1F5D3}\uFE0F Weekly Schedule: **${schedData.title}**`,
      `**Active Status:** ${statusIcon}`,
      ``,
      `<:fk_dot:1334970932657131560> This week's special event is: **${schedData.wEvent}**`,
      ``
    ].join("\n");
    const days = [
      "Member's Only Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];
    const body = days.map((day) => `__**${day}:**__
*(none)*`).join("\n\n");
    const displaySchedule = `${header}
${body}`;
    let guildMember = ctx.guild?.members.cache.get(ctx.user.id);
    if (!guildMember) {
      guildMember = await ctx.guild.members.fetch(ctx.user.id);
    }
    const displayName = guildMember.nickname ?? guildMember.user.username;
    const logChannel = ctx.client.channels.cache.get(
      "1374744395563270205"
    );
    logChannel.send(
      `<:v_russell:1375161867152130182> ${displayName} has started the **${schedData.title}** schedule.`
    );
    const channel = ctx.channel;
    return await channel.send({
      content: displaySchedule,
      allowedMentions: {
        parse: ["roles"]
      }
    });
  }
});
export {
  start_schedule_default as default
};
