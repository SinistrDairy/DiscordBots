import {
  ApplicationCommandOptionType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import eventsSchema from "../../models/profiles/event-schema.js";
import { suggestEvents } from "../suggestEvents.js";

export default commandModule({
  name: "event-management-edit",
  description: "🛠 Pick which part of your event to edit",
  type: CommandType.Slash,
  options: [
    {
        name: "name",
        type: ApplicationCommandOptionType.String,
        description: "Unique name of the event",
        required: true,
        autocomplete: true,
        command: {
          onEvent: [],
          execute: suggestEvents
        },

    }
  ],

  async execute(ctx) {
    const name = ctx.options.getString("name", true);
    const evt = await eventsSchema
      .findOne({
        name,
        serverID: ctx.guildId!,
      })
      .lean();

    if (!evt) {
      return ctx.reply({ content: "❌ Event not found.", ephemeral: true });
    }

    // Build a preview embed
    const embed = new EmbedBuilder()
      .setTitle(`Editing: ${evt.title}`)
      .setDescription(
        [
          `**Name:** \`${evt.name}\``,
          `**Display Title:** ${evt.title}`,
          `**Event Emoji:** ${evt.emojiID}`,
          `**Tags Role:** ${evt.tags}`,
          `**Rules List:** ${evt.daRulez.join(" | ")}`,
          `**Scoring List:** ${evt.scoring.join(" | ")}`,
          `**Point List:** ${evt.pointList.join(" | ")}`,
        ].join("\n")
      )
      .setColor("Orange");

    // Let admin pick which field they want to edit
    const fieldOptions = [
      { label: "Name", value: "name" },
      { label: "Display Title", value: "title" },
      { label: "Title Emoji", value: "titleEmoji" },
      { label: "Rules Emoji", value: "rulesEmoji" },
      { label: "Jewel Emoji", value: "jewelEmoji" },
      { label: "Event Emoji", value: "emojiID" },
      { label: "Tags Role", value: "tags" },
      { label: "Rules List", value: "daRulez" },
      { label: "Scoring List", value: "scoring" },
      { label: "Point List", value: "pointList" },
    ];

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`editField-${evt.name}`)
      .setPlaceholder("Select field to edit…")
      .addOptions(fieldOptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      menu
    );

    return ctx.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
});
