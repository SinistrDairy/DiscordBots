import {
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import eventsSchema from "../../models/profiles/event-schema.js";
import { eventDrafts } from "../eventDraftCache.js";
import { buildEventPreview } from "../buildEventPreview.js";

export const createOptions = [
  {
    name: "title_emoji",
    type: ApplicationCommandOptionType.String,
    description: "Emoji to prefix your event title",
    required: true,
  },
  {
    name: "rules_emoji",
    type: ApplicationCommandOptionType.String,
    description: "Bullet emoji for rules",
    required: true,
  },
  {
    name: "jewel_emoji",
    type: ApplicationCommandOptionType.String,
    description: "Jewel emoji for scoring",
    required: true,
  },
  {
    name: "event_emoji",
    type: ApplicationCommandOptionType.String,
    description: "Event scheduling emoji",
    required: true,
  },
  {
    name: "tags",
    type: ApplicationCommandOptionType.Role,
    description: "Role to tag",
    required: true,
  },
];

/**
 * Builds an event draft preview and shows a modal to collect final details.
 * @param ctx - The command context or interaction context
 */
export async function handleCreate(ctx: any) {
  // Construct draft from provided options
  const draft = {
    titleEmoji: ctx.options.getString("title_emoji", true),
    rulesEmoji: ctx.options.getString("rules_emoji", true),
    jewelEmoji: ctx.options.getString("jewel_emoji", true),
    eventEmoji: ctx.options.getString("event_emoji", true),
    tags: ctx.options.getRole("tags", true).toString(),
    serverID: ctx.guildId!,
  };
  eventDrafts.set(ctx.user.id, draft);

  // Send preview and cache its message ID
  const previewMsg = await ctx.channel!.send(
    await buildEventPreview(ctx, draft)
  );
  eventDrafts.set(ctx.user.id, { ...draft, previewMessageId: previewMsg.id });

  // Present modal for final inputs
  const modal = new ModalBuilder()
    .setCustomId("eventModal")
    .setTitle("Create Custom Event")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("name")
          .setLabel("Unique Name")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("machine-readable (no spaces)…")
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Display Title")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Human-friendly title…")
          .setRequired(true)
      )
    );

  // Show modal to the user
  return ctx.interaction.showModal(modal);
}