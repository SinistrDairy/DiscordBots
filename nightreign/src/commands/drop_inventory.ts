// drop_inventory.ts
import { commandModule, CommandType } from "@sern/handler";
import Character from "../models/character-schema.js";
import { MessageFlags } from "discord.js";

export default commandModule({
  type: CommandType.Button,
  name: "drop_inventory",
  execute: async (ctx) => {
    const char = await Character.findOne({ userId: ctx.user.id });

    if (
      !char ||
      typeof char.inventoryWeapon !== "string" ||
      char.inventoryWeapon === "none"
    ) {
      return ctx.reply({
        content: "⚠️ No weapon to drop.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const dropped = char.inventoryWeapon;
    char.inventoryWeapon = "none";
    await char.save();

    return ctx.reply({
      content: `🗑️ Dropped **${dropped}**.`,
      flags: MessageFlags.Ephemeral,
    });
  },
});
