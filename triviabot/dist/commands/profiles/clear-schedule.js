import { PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import scheduleSchema from "../../models/trivia/schedule-schema.js";
import { publishConfig } from "@sern/publisher";
var clear_schedule_default = commandModule({
  name: "clear-schedules",
  description: "Use this command to clear all saved schedules",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    })
  ],
  execute: async (ctx) => {
    await scheduleSchema.deleteMany({});
    const channel = ctx.client.channels.cache.get("1374744395563270205");
    channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has deleted all saved schedules.`);
    return await ctx.reply("all saved schedules have been deleted.");
  }
});
export {
  clear_schedule_default as default
};
