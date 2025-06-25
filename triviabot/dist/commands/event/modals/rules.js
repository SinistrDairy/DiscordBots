import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
var rules_default = commandModule({
  name: "addEventModal_rules",
  // ← matches the customId above
  type: CommandType.Modal,
  async execute(ctx) {
    try {
      const userId = ctx.user.id;
      const draft = eventDrafts.get(userId) ?? {
        serverID: ctx.guildId
      };
      const raw = ctx.fields.getTextInputValue("rules");
      draft.daRulez = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      eventDrafts.set(userId, draft);
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
      await ctx.editReply({ content: "\u2705 Event rules updated." });
      setTimeout(() => {
        ctx.deleteReply().catch(() => {
        });
      }, 5e3);
      return;
    } catch (error) {
      console.error("addEventModal_rules error:", error);
      return ctx.reply({
        content: "<:r_x:1376727384056922132> Oops, could not save your rules\u2014please try again.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
export {
  rules_default as default
};
