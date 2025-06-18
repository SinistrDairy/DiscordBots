import { commandModule, CommandType } from "@sern/handler";
import { PermissionFlagsBits } from "discord.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
import Weapons from "../../models/weapons-schema.js";
var fetchWeapons_default = commandModule({
  type: CommandType.Slash,
  name: "get-weapon-types",
  description: "Fetch each weapon type from the DB",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator])
  ],
  execute: async (ctx) => {
    const weaponTypes = await Weapons.distinct("type");
    return ctx.reply({
      content: `\u{1F5E1}\uFE0F Weapon Types:
${weaponTypes.join(", ")}`
    });
  }
});
export {
  fetchWeapons_default as default
};
