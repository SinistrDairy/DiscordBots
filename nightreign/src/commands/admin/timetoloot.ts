// src/commands/admin/timetoloot.ts
import { commandModule, CommandType, PluginType } from "@sern/handler";
import { PermissionFlagsBits } from "discord.js";
import LootStatus from "../../models/loot-status-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  type: CommandType.Slash,
  name: "timetoloot",
  description: "🔓 Toggle loot availability for players.",
  plugins: [
        publishConfig({
      guildIds: [process.env.GUILD_ID1!],
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
      `🔔 Looting has been **${newState ? "ENABLED" : "DISABLED"}**.`
    );
  },
});
