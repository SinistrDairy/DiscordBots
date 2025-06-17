export interface CharacterDefaults {
  stats: {
    evasion: number;
    armor: number;
    agility: number;
    strength: number;
    finesse: number;
    instinct: number;
    presence: number;
    knowledge: number;
  };
  maxHp: number;
  maxHope: number;
  maxStress: number;
}

export const classDefaults: Record<string, CharacterDefaults> = {
  Bard: {
    stats: {
      evasion: 1,
      armor: 0,
      agility: 2,
      strength: 0,
      finesse: 1,
      instinct: 1,
      presence: 3,
      knowledge: 2,
    },
    maxHp: 8,
    maxHope: 6,
    maxStress: 6,
  },

  Druid: {
    stats: {
      evasion: 1,
      armor: 0,
      agility: 1,
      strength: 1,
      finesse: 1,
      instinct: 3,
      presence: 2,
      knowledge: 2,
    },
    maxHp: 9,
    maxHope: 5,
    maxStress: 6,
  },

  Guardian: {
    stats: {
      evasion: 1,
      armor: 4,
      agility: 1,
      strength: 2,
      finesse: 0,
      instinct: 1,
      presence: 1,
      knowledge: 0,
    },
    maxHp: 14,
    maxHope: 3,
    maxStress: 5,
  },

  Ranger: {
    stats: {
      evasion: 2,
      armor: 1,
      agility: 3,
      strength: 2,
      finesse: 2,
      instinct: 2,
      presence: 0,
      knowledge: 0,
    },
    maxHp: 10,
    maxHope: 4,
    maxStress: 6,
  },

  Rogue: {
    stats: {
      evasion: 2,
      armor: 0,
      agility: 3,
      strength: 1,
      finesse: 2,
      instinct: 1,
      presence: 1,
      knowledge: 0,
    },
    maxHp: 8,
    maxHope: 4,
    maxStress: 5,
  },

  Seraph: {
    stats: {
      evasion: 1,
      armor: 3,
      agility: 1,
      strength: 3,
      finesse: 0,
      instinct: 2,
      presence: 2,
      knowledge: 0,
    },
    maxHp: 11,
    maxHope: 4,
    maxStress: 5,
  },

  Sorcerer: {
    stats: {
      evasion: 1,
      armor: 0,
      agility: 1,
      strength: 0,
      finesse: 1,
      instinct: 3,
      presence: 3,
      knowledge: 1,
    },
    maxHp: 7,
    maxHope: 5,
    maxStress: 6,
  },

  Warrior: {
    stats: {
      evasion: 1,
      armor: 2,
      agility: 2,
      strength: 3,
      finesse: 1,
      instinct: 1,
      presence: 0,
      knowledge: 0,
    },
    maxHp: 12,
    maxHope: 3,
    maxStress: 6,
  },

  Wizard: {
    stats: {
      evasion: 1,
      armor: 0,
      agility: 1,
      strength: 0,
      finesse: 0,
      instinct: 2,
      presence: 1,
      knowledge: 4,
    },
    maxHp: 6,
    maxHope: 5,
    maxStress: 6,
  },
};
