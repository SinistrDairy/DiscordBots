import {
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  ChatInputCommandInteraction,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import Character from "../models/character-schema.js";
import { classDefaults } from "../utils/classDefaults.js";

export default commandModule({
  type: CommandType.Slash,
  name: "startcharacter",
  description: "🎭 Begin your Nightreign journey with a custom class and name.",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!],
    }),
  ],
  options: [
    {
      name: "class",
      description: "Choose your character class",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: Object.keys(classDefaults).map((c) => ({ name: c, value: c })),
    },
    {
      name: "name",
      description: "Your character's name",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async execute(ctx) {
    const interaction = ctx.interaction as ChatInputCommandInteraction;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;
    const classChoice = ctx.options.getString("class", true);
    const charName = ctx.options.getString("name", true);
    const existing = await Character.findOne({ userId });

    const createCharacter = async () => {
      const data = classDefaults[classChoice];
      const char = new Character({
        userId,
        name: charName,
        class: classChoice,
        stats: data.stats,
        hp: data.maxHp,
        maxHp: data.maxHp,
        hope: data.maxHope,
        maxHope: data.maxHope,
        stress: 0,
        maxStress: data.maxStress,
        damage: {
          minor: 0,
          major: 0,
          severe: 0,
        },
        inventoryWeapon: "none",
        activeWeapon: "none",
      });
      await char.save();
    };

    if (!existing) {
      await createCharacter();
      return interaction.editReply({
        content: `✅ Character **${charName} the ${classChoice}** created!`,
      });
    }

    const confirmId = `delete_character_${userId}`;
    const confirmBtn = new ButtonBuilder()
      .setCustomId(confirmId)
      .setLabel("Delete Old Character")
      .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmBtn);

    await interaction.editReply({
      content: `⚠️ You already have a character. Do you want to delete it and start over?`,
      components: [row],
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.customId === confirmId && i.user.id === userId,
      max: 1,
      time: 30_000,
    });

    collector.on("collect", async (i) => {
      if (i.isButton()) {
        await i.deferUpdate();
        await Character.deleteOne({ userId });
        await createCharacter();

        await interaction.editReply({
          content: `✅ Character **${charName} the ${classChoice}** has been created!`,
          components: [],
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        try {
          await interaction.editReply({
            content: "❌ Character creation timed out. No changes made.",
            components: [],
          });
        } catch (err) {
          console.warn("Failed to edit reply on timeout:", err);
        }
      }
    });
  },
});
