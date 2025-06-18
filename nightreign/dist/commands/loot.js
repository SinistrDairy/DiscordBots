import { EmbedBuilder, MessageFlags } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import Weapon from "../models/weapons-schema.js";
import LootStatus from "../models/loot-status-schema.js";
import Character from "../models/character-schema.js";
import { publishConfig } from "@sern/publisher";
import {
  classTypeBonus
} from "../utils/classTypeBonus.js";
function getRarityColor(rarity) {
  switch (rarity?.toLowerCase()) {
    case "common":
      return 10395294;
    case "uncommon":
      return 5025616;
    case "rare":
      return 4149685;
    case "legendary":
      return 16750592;
    default:
      return 16777215;
  }
}
const rarityWeights = [
  { rarity: "Common", weight: 45 },
  { rarity: "Uncommon", weight: 25 },
  { rarity: "Rare", weight: 20 },
  { rarity: "Legendary", weight: 10 }
];
function getRandomRarity() {
  const total = rarityWeights.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const { rarity, weight } of rarityWeights) {
    if (roll < weight)
      return rarity;
    roll -= weight;
  }
  return "Common";
}
var loot_default = commandModule({
  type: CommandType.Slash,
  name: "loot",
  description: "\u{1F3B2} Roll a weighted random weapon from the loot pool.",
  plugins: [publishConfig({ guildIds: [process.env.GUILD_ID1] })],
  execute: async (ctx) => {
    const interaction = ctx.interaction;
    let deferred = false;
    try {
      const status = await LootStatus.findOne({ key: "lootEnabled" });
      if (!status?.value) {
        return interaction.reply({
          content: "\u{1F6AB} Looting is currently disabled.",
          flags: MessageFlags.Ephemeral
        });
      }
      const character = await Character.findOne({
        userId: interaction.user.id
      });
      if (!character) {
        return interaction.reply({
          content: "\u274C No character found. Ask your DM to add you.",
          flags: MessageFlags.Ephemeral
        });
      }
      const playerClass = character.class;
      const bonusMap = classTypeBonus[playerClass] ?? {};
      await interaction.deferReply();
      deferred = true;
      const rarity = getRandomRarity();
      const weapons = await Weapon.find({ rarity });
      if (!weapons.length) {
        return interaction.editReply({
          content: `\u26A0\uFE0F No weapon found for rarity **${rarity}**.`
        });
      }
      let totalWeight = 0;
      const weighted = weapons.map((w) => {
        const weaponType = w.type;
        const bonus = bonusMap[weaponType] ?? 1;
        totalWeight += bonus;
        return { weapon: w, weight: bonus };
      });
      let roll = Math.random() * totalWeight;
      let selectedWeapon = weighted[0].weapon;
      for (const { weapon, weight } of weighted) {
        if (roll < weight) {
          selectedWeapon = weapon;
          break;
        }
        roll -= weight;
      }
      const embed = new EmbedBuilder().setTitle(`\u{1F3B2} Loot Drop: ${selectedWeapon.name ?? "Unknown Weapon"}`).setDescription(
        `**Type:** ${selectedWeapon.type ?? "Unknown"}
**Rarity:** ${selectedWeapon.rarity ?? "Unknown"}`
      ).setColor(getRarityColor(selectedWeapon.rarity)).addFields(
        {
          name: "\u{1F5E1}\uFE0F Attack",
          inline: true,
          value: `\u2022 Physical: ${selectedWeapon.attack?.physical ?? 0}
\u2022 Magic: ${selectedWeapon.attack?.magic ?? 0}
\u2022 Fire: ${selectedWeapon.attack?.fire ?? 0}
\u2022 Lightning: ${selectedWeapon.attack?.lightning ?? 0}
\u2022 Holy: ${selectedWeapon.attack?.holy ?? 0}
\u2022 Crit: ${selectedWeapon.attack?.crit ?? 0}`
        },
        {
          name: "\u{1F6E1}\uFE0F Guard",
          inline: true,
          value: `\u2022 Physical: ${selectedWeapon.guard?.physical ?? 0}
\u2022 Magic: ${selectedWeapon.guard?.magic ?? 0}
\u2022 Fire: ${selectedWeapon.guard?.fire ?? 0}
\u2022 Lightning: ${selectedWeapon.guard?.lightning ?? 0}
\u2022 Holy: ${selectedWeapon.guard?.holy ?? 0}
\u2022 Boost: ${selectedWeapon.guard?.boost ?? 0}`
        },
        {
          name: "\u{1F4C8} Scaling",
          value: `STR: ${selectedWeapon.scaling?.strength ?? "-"} | DEX: ${selectedWeapon.scaling?.dexterity ?? "-"}
INT: ${selectedWeapon.scaling?.intelligence ?? "-"} | FTH: ${selectedWeapon.scaling?.faith ?? "-"}
ARC: ${selectedWeapon.scaling?.arcane ?? "-"}`
        },
        {
          name: "\u{1F4CA} Requirements",
          inline: true,
          value: `Level ${selectedWeapon.requirements?.level ?? "?"}`
        },
        {
          name: "\u2694\uFE0F Affinity",
          inline: true,
          value: selectedWeapon.affinity ?? "None"
        },
        {
          name: "\u{1FA78} Status Ailment",
          inline: true,
          value: selectedWeapon.status && typeof selectedWeapon.status.amount === "number" ? `${selectedWeapon.status.type} (${selectedWeapon.status.amount})` : "None"
        },
        {
          name: "\u2728 Weapon Skill",
          value: selectedWeapon.weaponSkill ?? "None"
        },
        {
          name: "\u{1F3AF} Unique Effect",
          value: selectedWeapon.uniqueEffect ?? "None"
        }
      );
      character.inventoryWeapon = selectedWeapon.name;
      await character.save();
      return interaction.editReply({
        content: `You found **${selectedWeapon.name}**! It\u2019s been added to your inventory.`,
        embeds: [embed]
      });
    } catch (err) {
      console.error("\u274C /loot error:", err);
      if (deferred) {
        return interaction.editReply({
          content: "\u{1F6A8} An error occurred while rolling loot."
        });
      }
      return interaction.reply({
        content: "\u{1F6A8} An error occurred while rolling loot.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
export {
  loot_default as default
};
