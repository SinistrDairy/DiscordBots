import {
  ApplicationCommandOptionType,
  MessageFlags
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import Character from "../models/character-schema.js";
import { publishConfig } from "@sern/publisher";
var adjust_character_default = commandModule({
  type: CommandType.Slash,
  name: "adjust-character",
  description: "\u{1F527} Adjust your character\u2019s Hope, Stress, or Damage.",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1]
    })
  ],
  options: [
    {
      name: "hope",
      type: ApplicationCommandOptionType.Integer,
      description: "New Hope value",
      required: false
    },
    {
      name: "stress",
      type: ApplicationCommandOptionType.Integer,
      description: "New Stress value",
      required: false
    },
    {
      name: "minor",
      type: ApplicationCommandOptionType.Integer,
      description: "Minor wounds",
      required: false
    },
    {
      name: "major",
      type: ApplicationCommandOptionType.Integer,
      description: "Major wounds",
      required: false
    },
    {
      name: "severe",
      type: ApplicationCommandOptionType.Integer,
      description: "Severe wounds",
      required: false
    }
  ],
  execute: async (ctx) => {
    const userId = ctx.user.id;
    const char = await Character.findOne({ userId });
    if (!char) {
      return ctx.reply({
        content: "\u274C No character found. Contact the DM.",
        flags: MessageFlags.Ephemeral
      });
    }
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
    const changes = [];
    if (newHope !== null) {
      char.hope = Math.min(Math.max(newHope, 0), char.maxHope ?? 0);
      changes.push(`\u{1F496} Hope \u2192 **${char.hope}**`);
    }
    if (newStress !== null) {
      char.stress = Math.min(Math.max(newStress, 0), char.maxStress ?? 0);
      changes.push(`\u{1F9E0} Stress \u2192 **${char.stress}**`);
    }
    if (minor !== null) {
      char.damage.minor = Math.max(minor, 0);
      changes.push(`\u{1F538} Minor \u2192 **${char.damage.minor}**`);
    }
    if (major !== null) {
      char.damage.major = Math.max(major, 0);
      changes.push(`\u{1F536} Major \u2192 **${char.damage.major}**`);
    }
    if (severe !== null) {
      char.damage.severe = Math.max(severe, 0);
      changes.push(`\u{1F534} Severe \u2192 **${char.damage.severe}**`);
    }
    await char.save();
    if (changes.length === 0) {
      return ctx.reply({
        content: "\u26A0\uFE0F No changes were made. Provide at least one option.",
        flags: MessageFlags.Ephemeral
      });
    }
    return ctx.reply({
      content: `\u2705 Updated:
${changes.join("\n")}`,
      flags: MessageFlags.Ephemeral
    });
  }
});
export {
  adjust_character_default as default
};
