import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
var scoring_default = commandModule({
  name: "addEventModal_scoring",
  type: CommandType.Modal,
  async execute(ctx) {
    const id = ctx.user.id;
    const draft = eventDrafts.get(id);
    const raw = ctx.fields.getTextInputValue("scoring");
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    draft.scoring = lines;
    draft.pointList = lines.map((l) => {
      const parts = l.split(",");
      return parts.length > 1 ? parts.slice(-1)[0].trim() : "0";
    });
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
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    await ctx.editReply({ content: "\u2705 Event scoring updated." });
    setTimeout(() => {
      ctx.deleteReply().catch(() => {
      });
    }, 5e3);
    return;
  }
});
export {
  scoring_default as default
};
