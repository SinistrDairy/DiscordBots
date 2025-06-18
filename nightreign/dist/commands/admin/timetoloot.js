import { commandModule, CommandType } from "@sern/handler";
import { PermissionFlagsBits } from "discord.js";
import LootStatus from "../../models/loot-status-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
var timetoloot_default = commandModule({
  type: CommandType.Slash,
  name: "timetoloot",
  description: "\u{1F513} Toggle loot availability for players.",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator])
  ],
  execute: async (ctx) => {
    const existing = await LootStatus.findOne({ key: "lootEnabled" });
    const newState = !existing?.value;
    await LootStatus.findOneAndUpdate(
      { key: "lootEnabled" },
      { value: newState },
      { upsert: true, new: true }
    );
    await ctx.reply(
      `\u{1F514} Looting has been **${newState ? "ENABLED" : "DISABLED"}**.`
    );
  }
});
export {
  timetoloot_default as default
};
