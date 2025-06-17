// src/commands/preview_submit.ts
import { CommandType, commandModule } from "@sern/handler";
import eventSchema from "../../../models/profiles/event-schema.js";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";

export default commandModule({
  name: "preview_submit",    // must match your Button’s customId
  type: CommandType.Button,
  async execute(ctx) {
    const userId = ctx.user.id;
    const draft = eventDrafts.get(userId) as EventDraft | undefined;

    if (!draft) {
      return ctx.reply({
        content: "❌ Nothing to submit—your draft has expired or was never created.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Upsert into MongoDB
    await eventSchema.findOneAndUpdate(
      { name: draft.name },
      {
        name:       draft.name,
        title:      draft.title,
        daRulez:    draft.daRulez,
        scoring:    draft.scoring,
        pointList: draft.pointList,
        tags:       draft.tags,
        serverID:   draft.serverID,
      },
      { upsert: true, new: true }
    );

    // Clean up local cache
    eventDrafts.delete(userId);

    // Final confirmation
    return ctx.update({
      content: `✅ Event **${draft.titleEmoji} ${draft.title}** has been saved!`,
      embeds:    [],
      components: [],
    });
  },
});
