// src/commands/utility/roll.ts
import { EmbedBuilder, MessageFlags } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";

type RollMode = "normal" | "advantage" | "disadvantage";

export default commandModule({
  type: CommandType.Slash,
  name: "roll",
  description: "🎲 Roll Daggerheart’s Duality Dice (Hope & Fear)",
  plugins: [publishConfig({ guildIds: [process.env.GUILD_ID1!] })],
  options: [
    {
      name: "mode",
      description: "Roll mode: normal, advantage, or disadvantage",
      type: 3, // STRING
      required: false,
      choices: [
        { name: "normal", value: "normal" },
        { name: "advantage", value: "advantage" },
        { name: "disadvantage", value: "disadvantage" },
      ],
    },
  ],
  execute: async (ctx) => {
    const interaction = ctx.interaction;
    try {
      // Determine roll mode
      const modeParam = ctx.options.getString("mode", false) as RollMode | null;
      const mode: RollMode = modeParam ?? "normal";

      // Helper to roll 1d12
      const rollD12 = () => Math.floor(Math.random() * 12) + 1;

      // Roll dual Hope dice and one Fear die
      const hope1 = rollD12();
      const hope2 = mode !== "normal" ? rollD12() : undefined;
      const fear = rollD12();

      // Determine final Hope only if advantage/disadvantage
      const hope =
        mode === "advantage"
          ? Math.max(hope1, hope2!)
          : mode === "disadvantage"
            ? Math.min(hope1, hope2!)
            : hope1;

      // Determine outcome
      const isCritical = hope === fear;
      const tie = hope === fear;
      const withHope = hope > fear;

      // Build result embed fields
      const fields: { name: string; value: string; inline: boolean }[] = [
        { name: "Hope Die", value: hope1.toString(), inline: true },
      ];

      // When rolling advantage/disadvantage, show other and final Hope
      if (mode !== "normal") {
        fields.push({
          name: "Other Hope",
          value: hope2!.toString(),
          inline: true,
        });
        fields.push({
          name: "Final Hope",
          value: hope.toString(),
          inline: true,
        });
      }

      // Always show Fear
      fields.push({ name: "Fear Die", value: fear.toString(), inline: true });

      // Build embed
      const embed = new EmbedBuilder()
        .setTitle("🎲 Duality Dice Roll")
        .addFields(fields)
        .setColor(isCritical ? 0xffd700 : withHope ? 0x4caf50 : 0xf44336)
        .setFooter({
          text: `${mode.charAt(0).toUpperCase() + mode.slice(1)} roll`,
        });

      // Build narrative
      const narrative: string[] = [];
      if (isCritical) {
        narrative.push("💥 Critical! Trigger a critical effect.");
      }
      if (tie) {
        narrative.push("🤝 Tie! Special tie effect if any.");
      } else if (withHope) {
        narrative.push("🎭 You roll with Hope and gain 1 Hope point.");
      } else {
        narrative.push("🎭 You roll with Fear and the GM gains 1 Fear point.");
      }

      // Send reply
      await interaction.reply({
        embeds: [embed],
        content: narrative.join("\n"),
      });
    } catch (error) {
      console.error("/roll error:", error);
      return interaction.reply({
        content: "🚨 Error rolling dice.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
