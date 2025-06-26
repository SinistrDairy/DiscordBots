import {
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";
var edit_default = commandModule({
  name: "edit_event",
  type: CommandType.Button,
  async execute(ctx) {
    await ctx.deferReply();
    const draft = eventDrafts.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:r_x:1376727384056922132> No draft found.",
        flags: MessageFlags.Ephemeral
      });
    }
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
  edit_default as default
};
