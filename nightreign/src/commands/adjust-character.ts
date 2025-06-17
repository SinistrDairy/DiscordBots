// src/commands/adjust-character.ts
import {
  ApplicationCommandOptionType,

  MessageFlags,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import Character from "../models/character-schema.js";

import { publishConfig } from "@sern/publisher";

export default commandModule({
  type: CommandType.Slash,
  name: "adjust-character",
  description: "🔧 Adjust your character’s Hope, Stress, or Damage.",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!],
    }),
  ],
  options: [
    {
      name: "hope",
      type: ApplicationCommandOptionType.Integer,
      description: "New Hope value",
      required: false,
    },
    {
      name: "stress",
      type: ApplicationCommandOptionType.Integer,
      description: "New Stress value",
      required: false,
    },
    {
      name: "minor",
      type: ApplicationCommandOptionType.Integer,
      description: "Minor wounds",
      required: false,
    },
    {
      name: "major",
      type: ApplicationCommandOptionType.Integer,
      description: "Major wounds",
      required: false,
    },
    {
      name: "severe",
      type: ApplicationCommandOptionType.Integer,
      description: "Severe wounds",
      required: false,
    },
  ],
  execute: async (ctx) => {
    const userId = ctx.user.id;
    const char = await Character.findOne({ userId });

    if (!char) {
      return ctx.reply({
        content: "❌ No character found. Contact the DM.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Ensure damage field exists
    if (!char.damage || typeof char.damage !== "object") {
      char.damage = { minor: 0, major: 0, severe: 0 };
    } else {
      char.damage.minor ??= 0;
      char.damage.major ??= 0;
      char.damage.severe ??= 0;
    }

    const newHope = ctx.options.getInteger("hope");
    const newStress = ctx.options.getInteger("stress");
    const minor = ctx.options.getInteger("minor");
    const major = ctx.options.getInteger("major");
    const severe = ctx.options.getInteger("severe");

    const changes: string[] = [];

    if (newHope !== null) {
      char.hope = Math.min(Math.max(newHope, 0), char.maxHope ?? 0);
      changes.push(`💖 Hope → **${char.hope}**`);
    }

    if (newStress !== null) {
      char.stress = Math.min(Math.max(newStress, 0), char.maxStress ?? 0);
      changes.push(`🧠 Stress → **${char.stress}**`);
    }

    if (minor !== null) {
      char.damage.minor = Math.max(minor, 0);
      changes.push(`🔸 Minor → **${char.damage.minor}**`);
    }

    if (major !== null) {
      char.damage.major = Math.max(major, 0);
      changes.push(`🔶 Major → **${char.damage.major}**`);
    }

    if (severe !== null) {
      char.damage.severe = Math.max(severe, 0);
      changes.push(`🔴 Severe → **${char.damage.severe}**`);
    }

    await char.save();

    if (changes.length === 0) {
      return ctx.reply({
        content: "⚠️ No changes were made. Provide at least one option.",
        flags: MessageFlags.Ephemeral,
      });
    }

    return ctx.reply({
      content: `✅ Updated:\n${changes.join("\n")}`,
      flags: MessageFlags.Ephemeral,
    });
  },
});
