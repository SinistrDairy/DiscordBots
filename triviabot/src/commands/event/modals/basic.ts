// src/commands/addEventModal_basic.ts
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import { MessageFlags, MessageFlagsBitField } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";

export default commandModule({
  name: "eventModal",
  type: CommandType.Modal,
  async execute(ctx) {
    const id = ctx.user.id;
    const draft: Partial<EventDraft> = eventDrafts.get(id) ?? {};
    const titleString = ctx.fields.getTextInputValue("title").trim();

    draft.name = ctx.fields.getTextInputValue("name").trim();
    draft.title = titleString;
    draft.serverID = ctx.guildId!;

    eventDrafts.set(id, draft);

    const preview = await buildEventPreview(ctx, draft);

    if (draft.previewMessageId) {
      try {
        const message = await ctx.channel?.messages.fetch(
          draft.previewMessageId
        );
        if (message) {
          await message.edit(preview);
        }
      } catch (err) {
        console.warn("Failed to edit preview message:", err);
      }
    }
    // Acknowledge modal interaction with confirmation
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    await ctx.editReply({ content: "✅ Event basic info updated." });
    setTimeout(() => {
      ctx.deleteReply().catch(()  => {});
    }, 5_000);
    return;
  },
});
