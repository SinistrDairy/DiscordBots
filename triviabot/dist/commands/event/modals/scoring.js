import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";
var scoring_default = commandModule({
  name: "event_scoring",
  type: CommandType.Modal,
  async execute(ctx) {
    await ctx.deferReply();
    const id = ctx.user.id;
    const draft = eventDrafts.get(id);
    const raw = ctx.fields.getTextInputValue("scoring");
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    draft.scoring = lines;
    eventDrafts.set(id, draft);
    const preview = await buildEventPreview(ctx, draft);
    const menuRow = buildKeyMenu(draft.key);
    const channel = await ctx.client.channels.fetch(
      draft.previewChannelId
    );
    const msg = await channel.messages.fetch(draft.previewMessageId);
    await msg.edit({
      ...preview,
      components: [menuRow]
    });
    return ctx.deleteReply();
  }
});
export {
  scoring_default as default
};
