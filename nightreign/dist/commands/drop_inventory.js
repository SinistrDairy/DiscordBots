import { commandModule, CommandType } from "@sern/handler";
import Character from "../models/character-schema.js";
import { MessageFlags } from "discord.js";
var drop_inventory_default = commandModule({
  type: CommandType.Button,
  name: "drop_inventory",
  execute: async (ctx) => {
    const char = await Character.findOne({ userId: ctx.user.id });
    if (!char || typeof char.inventoryWeapon !== "string" || char.inventoryWeapon === "none") {
      return ctx.reply({
        content: "\u26A0\uFE0F No weapon to drop.",
        flags: MessageFlags.Ephemeral
      });
    }
    const dropped = char.inventoryWeapon;
    char.inventoryWeapon = "none";
    await char.save();
    return ctx.reply({
      content: `\u{1F5D1}\uFE0F Dropped **${dropped}**.`,
      flags: MessageFlags.Ephemeral
    });
  }
});
export {
  drop_inventory_default as default
};
