import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import Character from "../models/character-schema.js";
var character_default = commandModule({
  type: CommandType.Slash,
  name: "character",
  description: "\u{1F4DC} View your character sheet and equipment.",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1]
    })
  ],
  async execute(ctx) {
    const interaction = ctx.interaction;
    const userId = interaction.user.id;
    const character = await Character.findOne({ userId });
    if (!character) {
      return await interaction.reply({
        content: "\u274C You don't have a character yet. Ask the DM to make you one.",
        flags: MessageFlags.Ephemeral
      });
    }
    const inventoryWeapon = character.inventoryWeapon && character.inventoryWeapon !== "none" ? character.inventoryWeapon : "None";
    const activeWeapon = character.activeWeapon && character.activeWeapon !== "none" ? character.activeWeapon : "None";
    const minor = character.damage?.minor ?? 0;
    const major = character.damage?.major ?? 0;
    const severe = character.damage?.severe ?? 0;
    const embed = new EmbedBuilder().setTitle(`${character.name}'s Character Sheet`).setDescription(`### ${character.class}`).addFields(
      { name: "\u{1F5E1} Active Weapon", value: activeWeapon, inline: true },
      { name: "\u{1F392} Inventory Weapon", value: inventoryWeapon, inline: true },
      {
        name: "\u{1F496} Hope",
        value: `${character.hope}/${character.maxHope}`,
        inline: true
      },
      {
        name: "\u{1F9E0} Stress",
        value: `${character.stress}/${character.maxStress}`,
        inline: true
      },
      { name: "\u{1F4A2} Minor", value: `${minor}`, inline: true },
      { name: "\u{1F525} Major", value: `${major}`, inline: true },
      { name: "\u2620\uFE0F Severe", value: `${severe}`, inline: true }
    ).setColor("DarkPurple");
    const hasWeapon = character.activeWeapon !== "none" || character.inventoryWeapon !== "none";
    const hasInventory = character.inventoryWeapon !== "none";
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("swap_weapon").setLabel("Swap").setStyle(ButtonStyle.Primary).setDisabled(!hasWeapon),
      new ButtonBuilder().setCustomId("drop_inventory").setLabel("Drop").setStyle(ButtonStyle.Danger).setDisabled(!hasInventory)
    );
    return await interaction.reply({
      embeds: [embed],
      components: hasWeapon ? [row] : [],
      flags: MessageFlags.Ephemeral
    });
  }
});
export {
  character_default as default
};
