import { commandModule, CommandType } from "@sern/handler";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} from "discord.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import {
  saveDraftToDB,
  DuplicateEventError
} from "../../../utils/draftToEvent.js";
var submit_default = commandModule({
  name: "save_event",
  type: CommandType.Button,
  async execute(ctx) {
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    const draft = eventDrafts.get(ctx.user.id);
    if (!draft) {
      return ctx.editReply({ content: "\u274C Nothing to save." });
    }
    try {
      await saveDraftToDB(draft);
      eventDrafts.delete(ctx.user.id);
      const chan = await ctx.client.channels.fetch(
        draft.previewChannelId
      );
      await (await chan.messages.fetch(draft.previewMessageId)).edit({
        content: `\u2705 **${draft.name}** saved.`,
        components: []
      });
      return ctx.deleteReply();
    } catch (err) {
      if (err instanceof DuplicateEventError) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("confirm_overwrite").setLabel("Overwrite").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
        );
        return ctx.editReply({
          content: `\u26A0\uFE0F An event called **${draft.name}** already exists. Overwrite it?`,
          components: [row]
        });
      }
      console.error(err);
      return ctx.editReply({ content: `\u274C Save failed: ${err.message}` });
    }
  }
});
export {
  submit_default as default
};
