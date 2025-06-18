import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
var basic_default = commandModule({
  name: "eventModal",
  type: CommandType.Modal,
  async execute(ctx) {
    const id = ctx.user.id;
    const draft = eventDrafts.get(id) ?? {};
    const titleString = ctx.fields.getTextInputValue("title").trim();
    draft.name = ctx.fields.getTextInputValue("name").trim();
    draft.title = titleString;
    draft.serverID = ctx.guildId;
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
    await ctx.editReply({ content: "\u2705 Event basic info updated." });
    setTimeout(() => {
      ctx.deleteReply().catch(() => {
      });
    }, 5e3);
    return;
  }
});
export {
  basic_default as default
};
