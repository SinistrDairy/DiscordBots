// src/commands/admin/timetoloot.ts
import { commandModule, CommandType, PluginType } from "@sern/handler";
import { PermissionFlagsBits } from "discord.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
import Weapons from "../../models/weapons-schema.js";

export default commandModule({
  type: CommandType.Slash,
  name: "get-weapon-types",
  description: "Fetch each weapon type from the DB",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  execute: async (ctx) => {
    const weaponTypes = (await Weapons.distinct("type")) as string[];

    return ctx.reply({
      content: `🗡️ Weapon Types:\n${weaponTypes.join(", ")}`,
    });
  },
});
