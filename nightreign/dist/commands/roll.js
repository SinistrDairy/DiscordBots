import { EmbedBuilder, MessageFlags } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
var roll_default = commandModule({
  type: CommandType.Slash,
  name: "roll",
  description: "\u{1F3B2} Roll Daggerheart\u2019s Duality Dice (Hope & Fear)",
  plugins: [publishConfig({ guildIds: [process.env.GUILD_ID1] })],
  options: [
    {
      name: "mode",
      description: "Roll mode: normal, advantage, or disadvantage",
      type: 3,
      // STRING
      required: false,
      choices: [
        { name: "normal", value: "normal" },
        { name: "advantage", value: "advantage" },
        { name: "disadvantage", value: "disadvantage" }
      ]
    }
  ],
  execute: async (ctx) => {
    const interaction = ctx.interaction;
    try {
      const modeParam = ctx.options.getString("mode", false);
      const mode = modeParam ?? "normal";
      const rollD12 = () => Math.floor(Math.random() * 12) + 1;
      const hope1 = rollD12();
      const hope2 = mode !== "normal" ? rollD12() : void 0;
      const fear = rollD12();
      const hope = mode === "advantage" ? Math.max(hope1, hope2) : mode === "disadvantage" ? Math.min(hope1, hope2) : hope1;
      const isCritical = hope === fear;
      const tie = hope === fear;
      const withHope = hope > fear;
      const fields = [
        { name: "Hope Die", value: hope1.toString(), inline: true }
      ];
      if (mode !== "normal") {
        fields.push({
          name: "Other Hope",
          value: hope2.toString(),
          inline: true
        });
        fields.push({
          name: "Final Hope",
          value: hope.toString(),
          inline: true
        });
      }
      fields.push({ name: "Fear Die", value: fear.toString(), inline: true });
      const embed = new EmbedBuilder().setTitle("\u{1F3B2} Duality Dice Roll").addFields(fields).setColor(isCritical ? 16766720 : withHope ? 5025616 : 16007990).setFooter({
        text: `${mode.charAt(0).toUpperCase() + mode.slice(1)} roll`
      });
      const narrative = [];
      if (isCritical) {
        narrative.push("\u{1F4A5} Critical! Trigger a critical effect.");
      }
      if (tie) {
        narrative.push("\u{1F91D} Tie! Special tie effect if any.");
      } else if (withHope) {
        narrative.push("\u{1F3AD} You roll with Hope and gain 1 Hope point.");
      } else {
        narrative.push("\u{1F3AD} You roll with Fear and the GM gains 1 Fear point.");
      }
      await interaction.reply({
        embeds: [embed],
        content: narrative.join("\n")
      });
    } catch (error) {
      console.error("/roll error:", error);
      return interaction.reply({
        content: "\u{1F6A8} Error rolling dice.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
export {
  roll_default as default
};
