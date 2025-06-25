// src/commands/addEventModal_rules.ts
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";

export default commandModule({
  name: "addEventModal_rules", // ← matches the customId above
  type: CommandType.Modal,
  async execute(ctx) {
    try {
      const userId = ctx.user.id;
      // If there’s no draft yet, create a fresh one (so you don’t get undefined)
      const draft: Partial<EventDraft> = eventDrafts.get(userId) ?? {
        serverID: ctx.guildId!,
      };

      // Grab the text box value
      const raw = ctx.fields.getTextInputValue("rules");
      // Split on newlines into an array
      draft.daRulez = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      eventDrafts.set(userId, draft as EventDraft);

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
      await ctx.editReply({ content: "✅ Event rules updated." });
      setTimeout(() => {
        ctx.deleteReply().catch(() => {});
      }, 5_000);
      return;
    } catch (error) {
      console.error("addEventModal_rules error:", error);
      return ctx.reply({
        content: "<:r_x:1376727384056922132> Oops, could not save your rules—please try again.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
