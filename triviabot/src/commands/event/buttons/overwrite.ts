import { commandModule, CommandType } from "@sern/handler";
import { ButtonInteraction, MessageFlags, TextChannel } from "discord.js";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import { saveDraftToDB } from "../../../utils/draftToEvent.js";

export default commandModule({
  type: CommandType.Button,
  name: "confirm_overwrite",
  async execute(ctx: ButtonInteraction) {
    await ctx.deferUpdate();
    const draft = eventDrafts.get(ctx.user.id) as EventDraft | undefined;
    if (!draft) return ctx.update({ content: "❌ Draft not found." });

    try {
      await saveDraftToDB(draft, true);
      eventDrafts.delete(ctx.user.id);

      const channel = (await ctx.client.channels.fetch(
        draft.previewChannelId!
      )) as TextChannel;
      const msg = await channel.messages.fetch(draft.previewMessageId!);
      const updated = await msg.edit({
        content: `✅ **${draft.name}** overwritten successfully.`,
        components: [],
      });
      setTimeout(async () => {
        updated.delete();
      }, 3_000);

      return ctx.deleteReply();
    } catch (err: any) {
      console.error("Overwrite failed:", err);
      return ctx.editReply({ content: `❌ Overwrite failed: ${err.message}` });
    }
  },
});
