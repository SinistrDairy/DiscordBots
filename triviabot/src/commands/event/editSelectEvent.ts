// src/events/edit-select-event.ts
import { commandModule, CommandType } from "@sern/handler";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { eventDrafts, DraftKey, EventDraft } from "../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../utils/buildEventPreview.js";
import eventSchema from "../../models/profiles/event-schema.js";

export default commandModule({
  type: CommandType.StringSelect,
  name: "editSelectEvent",
  async execute(ctx: StringSelectMenuInteraction) {
    await ctx.deferReply();
    const selectedName = ctx.values[0];
    // 1️⃣ Fetch the full event
    const evt = await eventSchema
      .findOne({
        name: selectedName,
        serverID: ctx.guildId!,
      })
      .lean();
    if (!evt) {
      return ctx.reply({
        content: "<:r_x:1376727384056922132> Event not found.",
        components: [],
        embeds: [],
      });
    }

    // 2️⃣ Build an EventDraft from every DB field
    const draft: Partial<EventDraft> = {
      key: "event",
      name: selectedName,
      title: evt.title,
      daRulez: evt.daRulez,
      scoring: evt.scoring,
      pointList: evt.pointList,
      eventEmoji: evt.eEmojiID,
      rulesEmoji: evt.rEmojiID,
      tags: evt.tags,
      serverID: evt.serverID,
      // you can store previewMessageId later when actually sending the preview
    };
    eventDrafts.set(ctx.user.id, draft);

    // 3️⃣ Generate the preview payload
    const preview = await buildEventPreview(ctx, draft);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("save_event")
        .setLabel("Save")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("edit_event") // go back into editing flow
        .setLabel("Edit")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    await ctx.editReply({
      ...preview,
      components: [row],
    });

    const sentMsg = await ctx.fetchReply();
    draft.previewMessageId = sentMsg.id;
    draft.previewChannelId = ctx.channelId!;
    eventDrafts.set(ctx.user.id, draft)
  },
});
