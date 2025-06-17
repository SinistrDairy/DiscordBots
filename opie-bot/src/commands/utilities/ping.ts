import "dotenv/config.js"
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { PermissionFlagsBits } from "discord.js";
import { requirePermission } from "../../plugins/requirePermission.js";

export default commandModule({
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  description: "A ping command",
  //alias : [],
  execute: async (ctx, args) => {

    await ctx.reply("Pong 🏓");
  },
});
