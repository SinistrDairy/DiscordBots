import { commandModule, CommandType } from "@sern/handler";
import Character from "../models/character-schema.js";
import { MessageFlags } from "discord.js";
var weapon_button_default = commandModule({
  type: CommandType.Button,
  name: "swap_weapon",
  execute: async (ctx) => {
    const char = await Character.findOne({ userId: ctx.user.id });
    if (!char || typeof char.activeWeapon !== "string" || typeof char.inventoryWeapon !== "string") {
      return ctx.reply({
        content: "\u274C Character or weapons missing.",
        flags: MessageFlags.Ephemeral
      });
    }
    const prevActive = char.activeWeapon;
    const prevInventory = char.inventoryWeapon;
    char.activeWeapon = prevInventory;
    char.inventoryWeapon = prevActive;
    await char.save();
    return ctx.reply({
      content: `\u{1F501} Swapped!
\u{1F5E1} Active: **${char.activeWeapon}**
\u{1F392} Inventory: **${char.inventoryWeapon}**`,
      flags: MessageFlags.Ephemeral
    });
  }
});
export {
  weapon_button_default as default
};
