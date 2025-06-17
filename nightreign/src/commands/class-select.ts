// src/commands/class_select.ts
import { commandModule, CommandType } from '@sern/handler';
import Character from '../models/character-schema.js';
import { classDefaults } from '../utils/classDefaults.js';
import { MessageFlags } from 'discord.js';

export default commandModule({
  type: CommandType.StringSelect,
  name: 'class_select',
  execute: async (ctx) => {
    const selectedClass = ctx.values[0];
    const userId = ctx.user.id;
    const exists = await Character.findOne({ userId });
    if (exists) {
      return ctx.reply({ content: '⚠️ Character already exists.', flags: MessageFlags.Ephemeral });
    }

    const def = classDefaults[selectedClass];
    const char = await Character.create({
      userId,
      class: selectedClass,
      stats: def.stats,
      hp: def.maxHp,
      hope: def.maxHope,
      stress: 0,
      maxHp: def.maxHp,
      maxHope: def.maxHope,
      maxStress: def.maxStress,
      damage: { minor: 0, major: 0, severe: 0 },
      inventory: [],
      activeWeapon: null,
    });

    await ctx.reply({
      content: `✅ Character created as **${selectedClass}**! You can now loot and fight.`,
      flags: MessageFlags.Ephemeral,
    });
  },
});
