// src/commands/character.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ChatInputCommandInteraction,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import Character from "../models/character-schema.js";

export default commandModule({
  type: CommandType.Slash,
  name: "character",
  description: "📜 View your character sheet and equipment.",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!],
    }),
  ],
  async execute(ctx) {
    const interaction = ctx.interaction as ChatInputCommandInteraction;
    const userId = interaction.user.id;
    const character = await Character.findOne({ userId });

    if (!character) {
      return await interaction.reply({
        content:
          "❌ You don't have a character yet. Ask the DM to make you one.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Fallback weapon logic
    const inventoryWeapon =
      character.inventoryWeapon && character.inventoryWeapon !== "none"
        ? character.inventoryWeapon
        : "None";

    const activeWeapon =
      character.activeWeapon && character.activeWeapon !== "none"
        ? character.activeWeapon
        : "None";

    // Fallback damage logic
    const minor = character.damage?.minor ?? 0;
    const major = character.damage?.major ?? 0;
    const severe = character.damage?.severe ?? 0;

    const embed = new EmbedBuilder()
      .setTitle(`${character.name}'s Character Sheet`)
      .setDescription(`### ${character.class}`)
      .addFields(
        { name: "🗡 Active Weapon", value: activeWeapon, inline: true },
        { name: "🎒 Inventory Weapon", value: inventoryWeapon, inline: true },
        {
          name: "💖 Hope",
          value: `${character.hope}/${character.maxHope}`,
          inline: true,
        },
        {
          name: "🧠 Stress",
          value: `${character.stress}/${character.maxStress}`,
          inline: true,
        },
        { name: "💢 Minor", value: `${minor}`, inline: true },
        { name: "🔥 Major", value: `${major}`, inline: true },
        { name: "☠️ Severe", value: `${severe}`, inline: true }
      )
      .setColor("DarkPurple");

    const hasWeapon =
      character.activeWeapon !== "none" || character.inventoryWeapon !== "none";
    const hasInventory = character.inventoryWeapon !== "none";

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("swap_weapon")
        .setLabel("Swap")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(!hasWeapon),
      new ButtonBuilder()
        .setCustomId("drop_inventory")
        .setLabel("Drop")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!hasInventory)
    );

    return await interaction.reply({
      embeds: [embed],
      components: hasWeapon ? [row] : [],
      flags: MessageFlags.Ephemeral,
    });
  },
});
