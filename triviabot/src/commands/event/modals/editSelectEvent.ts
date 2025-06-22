// src/events/edit-select-event.ts
import { commandModule, CommandType } from "@sern/handler";
import {
  ActionRowBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import eventSchema from "../../../models/profiles/event-schema.js";

export default commandModule({
  type: CommandType.StringSelect,
  name: "editSelectEvent",
  async execute(ctx: StringSelectMenuInteraction) {
    const selectedName = ctx.values[0];
    // 1️⃣ Fetch the full event
    const evt = await eventSchema
      .findOne({
        name: selectedName,
        serverID: ctx.guildId!,
      })
      .lean();
    if (!evt) {
      return ctx.update({
        content: "❌ Event not found.",
        components: [],
        embeds: [],
      });
    }

    // 2️⃣ Build an EventDraft from every DB field
    const draft = {
      name: selectedName,
      title: evt.title,
      eventEmoji: evt.emojiID,
      tags: evt.tags,
      daRulez: evt.daRulez,
      scoring: evt.scoring,
      pointList: evt.pointList,
      serverID: evt.serverID,
      // you can store previewMessageId later when actually sending the preview
    };
    eventDrafts.set(ctx.user.id, draft);

    // 3️⃣ Generate the preview payload
    const preview = await buildEventPreview(ctx, draft);

    // 4️⃣ Build a second dropdown of "which field to edit"
    const fields = [
      { label: "Display Title", value: "title" },
      { label: "Title Emoji", value: "titleEmoji" },
      { label: "Rules Emoji", value: "rulesEmoji" },
      { label: "Jewel Emoji", value: "jewelEmoji" },
      { label: "Event Emoji", value: "eventEmoji" },
      { label: "Tags Role", value: "tags" },
      { label: "Rules List", value: "daRulez" },
      { label: "Scoring List", value: "scoring" },
      { label: "Point List", value: "pointList" },
    ];
    const fieldMenu = new StringSelectMenuBuilder()
      .setCustomId(`editSelectField-${selectedName}`)
      .setPlaceholder("Select field to edit…")
      .addOptions(fields);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      fieldMenu
    );

    // 5️⃣ Update the original ephemeral message:
    //    show your preview + the field-picker menu
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      ...preview,
      components: [row],
    });
  },
});
