// Utility: maps each Daggerheart class to weapon-type drop-rate bonuses

export type CharacterClass =
  | "Bard"
  | "Druid"
  | "Guardian"
  | "Ranger"
  | "Rogue"
  | "Seraph"
  | "Sorcerer"
  | "Warrior"
  | "Wizard";

export type WeaponType =
  | "Axe"
  | "Bow"
  | "Colossal Weapon"
  | "Curved Sword"
  | "Dagger"
  | "Fist"
  | "Halberd"
  | "Hammer"
  | "Katana"
  | "Spear"
  | "Staff"
  | "Straight Sword"
  | "Thrusting Sword";

// For any weapon type not listed, the multiplier defaults to 1.
export const classTypeBonus: Record<
  CharacterClass,
  Partial<Record<WeaponType, number>>
> = {
  Bard: {
    "Straight Sword": 1.2,
    Staff: 1.3,
    Dagger: 1.0,
    Bow: 1.0,
  },

  Druid: {
    Staff: 1.8,
    Spear: 1.3,
  },

  Guardian: {
    Halberd: 1.8,
    Spear: 1.8,
  },

  Ranger: {
    Bow: 1.9,
    Dagger: 1.4,
    "Straight Sword": 0.9,
  },

  Rogue: {
    Dagger: 1.9,
    "Thrusting Sword": 1.6,
    "Curved Sword": 1.3,
  },

  Seraph: {
    "Straight Sword": 1.6,
    Staff: 1.3,
    Hammer: 1.3,
  },

  Sorcerer: {
    Staff: 1.9,
    "Curved Sword": 1.6,
    Dagger: 0.8,
  },

  Warrior: {
    Axe: 1.3,
    "Straight Sword": 1.2,
    "Colossal Weapon": 1.2,
    Hammer: 1.1,
  },

  Wizard: {
    Staff: 1.9,
    "Curved Sword": 0.8,
    "Thrusting Sword": 0.6,
  },
};
