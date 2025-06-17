import { EmbedBuilder, MessageFlags } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import Weapon from "../models/weapons-schema.js";
import LootStatus from "../models/loot-status-schema.js";
import Character from "../models/character-schema.js";
import { publishConfig } from "@sern/publisher";
import {
  classTypeBonus,
  CharacterClass,
  WeaponType,
} from "../utils/classTypeBonus.js";

function getRarityColor(rarity?: string): number {
  switch (rarity?.toLowerCase()) {
    case "common":
      return 0x9e9e9e;
    case "uncommon":
      return 0x4caf50;
    case "rare":
      return 0x3f51b5;
    case "legendary":
      return 0xff9800;
    default:
      return 0xffffff;
  }
}

const rarityWeights = [
  { rarity: "Common", weight: 45 },
  { rarity: "Uncommon", weight: 25 },
  { rarity: "Rare", weight: 20 },
  { rarity: "Legendary", weight: 10 },
];

function getRandomRarity(): string {
  const total = rarityWeights.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const { rarity, weight } of rarityWeights) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return "Common";
}

export default commandModule({
  type: CommandType.Slash,
  name: "loot",
  description: "🎲 Roll a weighted random weapon from the loot pool.",
  plugins: [publishConfig({ guildIds: [process.env.GUILD_ID1!] })],

  execute: async (ctx) => {
    const interaction = ctx.interaction;
    let deferred = false;

    try {
      // 1) Check if loot enabled
      const status = await LootStatus.findOne({ key: "lootEnabled" });
      if (!status?.value) {
        return interaction.reply({
          content: "🚫 Looting is currently disabled.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // 2) Fetch player character (for class)
      const character = await Character.findOne({
        userId: interaction.user.id,
      });
      if (!character) {
        return interaction.reply({
          content: "❌ No character found. Ask your DM to add you.",
          flags: MessageFlags.Ephemeral,
        });
      }
      const playerClass = character.class as CharacterClass;
      const bonusMap = classTypeBonus[playerClass] ?? {};

      // 3) Defer public reply
      await interaction.deferReply();
      deferred = true;

      // 4) Pick rarity
      const rarity = getRandomRarity();

      // 5) Load all weapons of this rarity
      const weapons = (await Weapon.find({ rarity })) as Array<
        typeof Weapon.prototype
      >;
      if (!weapons.length) {
        return interaction.editReply({
          content: `⚠️ No weapon found for rarity **${rarity}**.`,
        });
      }

      // 6) Weighted random based on classTypeBonus
      let totalWeight = 0;
      const weighted = weapons.map((w) => {
        // Cast w.type to our WeaponType union for safe indexing
        const weaponType = w.type as WeaponType;
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

      // 7) Build embed for the selected weapon
      const embed = new EmbedBuilder()
        .setTitle(`🎲 Loot Drop: ${selectedWeapon.name ?? "Unknown Weapon"}`)
        .setDescription(
          `**Type:** ${selectedWeapon.type ?? "Unknown"}\n` +
            `**Rarity:** ${selectedWeapon.rarity ?? "Unknown"}`
        )
        .setColor(getRarityColor(selectedWeapon.rarity))
        .addFields(
          {
            name: "🗡️ Attack",
            inline: true,
            value:
              `• Physical: ${selectedWeapon.attack?.physical ?? 0}\n` +
              `• Magic: ${selectedWeapon.attack?.magic ?? 0}\n` +
              `• Fire: ${selectedWeapon.attack?.fire ?? 0}\n` +
              `• Lightning: ${selectedWeapon.attack?.lightning ?? 0}\n` +
              `• Holy: ${selectedWeapon.attack?.holy ?? 0}\n` +
              `• Crit: ${selectedWeapon.attack?.crit ?? 0}`,
          },
          {
            name: "🛡️ Guard",
            inline: true,
            value:
              `• Physical: ${selectedWeapon.guard?.physical ?? 0}\n` +
              `• Magic: ${selectedWeapon.guard?.magic ?? 0}\n` +
              `• Fire: ${selectedWeapon.guard?.fire ?? 0}\n` +
              `• Lightning: ${selectedWeapon.guard?.lightning ?? 0}\n` +
              `• Holy: ${selectedWeapon.guard?.holy ?? 0}\n` +
              `• Boost: ${selectedWeapon.guard?.boost ?? 0}`,
          },
          {
            name: "📈 Scaling",
            value:
              `STR: ${selectedWeapon.scaling?.strength ?? "-"} | DEX: ${selectedWeapon.scaling?.dexterity ?? "-"}\n` +
              `INT: ${selectedWeapon.scaling?.intelligence ?? "-"} | FTH: ${selectedWeapon.scaling?.faith ?? "-"}\n` +
              `ARC: ${selectedWeapon.scaling?.arcane ?? "-"}`,
          },
          {
            name: "📊 Requirements",
            inline: true,
            value: `Level ${selectedWeapon.requirements?.level ?? "?"}`,
          },
          {
            name: "⚔️ Affinity",
            inline: true,
            value: selectedWeapon.affinity ?? "None",
          },
          {
            name: "🩸 Status Ailment",
            inline: true,
            value:
              selectedWeapon.status &&
              typeof selectedWeapon.status.amount === "number"
                ? `${selectedWeapon.status.type} (${selectedWeapon.status.amount})`
                : "None",
          },
          {
            name: "✨ Weapon Skill",
            value: selectedWeapon.weaponSkill ?? "None",
          },
          {
            name: "🎯 Unique Effect",
            value: selectedWeapon.uniqueEffect ?? "None",
          }
        );

      // 8) Save drop to character
      character.inventoryWeapon = selectedWeapon.name!;
      await character.save();

      // 9) Send final reply
      return interaction.editReply({
        content: `You found **${selectedWeapon.name}**! It’s been added to your inventory.`,
        embeds: [embed],
      });
    } catch (err) {
      console.error("❌ /loot error:", err);
      if (deferred) {
        return interaction.editReply({
          content: "🚨 An error occurred while rolling loot.",
        });
      }
      return interaction.reply({
        content: "🚨 An error occurred while rolling loot.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
