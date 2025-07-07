// src/commands/preview_submit.ts
import { commandModule, CommandType } from "@sern/handler";
import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  TextChannel,
} from "discord.js";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import {
  saveDraftToDB,
  DuplicateEventError,
} from "../../../utils/draftToEvent.js";

export default commandModule({
  name: "save_event",
  type: CommandType.Button,
  async execute(ctx: ButtonInteraction) {
    await ctx.deferReply({});
    const draft = eventDrafts.get(ctx.user.id) as EventDraft | undefined;
    if (!draft) {
      return ctx.editReply({ content: "❌ Nothing to save." });
    }

    try {
      await saveDraftToDB(draft);
      // Success path…
      eventDrafts.delete(ctx.user.id);
      const chan = (await ctx.client.channels.fetch(
        draft.previewChannelId!
      )) as TextChannel;
      await (
        await chan.messages.fetch(draft.previewMessageId!)
      ).edit({
        content: `✅ **${draft.name}** saved.`,
        components: [],
      });
      return ctx.deleteReply();
    } catch (err: any) {
      if (err instanceof DuplicateEventError) {
        // 1) Build confirm/cancel buttons
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("confirm_overwrite")
            .setLabel("Overwrite")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
        );
        // 2) Prompt the user
        return ctx.editReply({
          content: `⚠️ An event called **${draft.name}** already exists. Overwrite it?`,
          components: [row],
        });
        
      }
      // Other errors
      console.error(err);
      return ctx.editReply({ content: `❌ Save failed: ${err.message}` });
    }
  },
});
