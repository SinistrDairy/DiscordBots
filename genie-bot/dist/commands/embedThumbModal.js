import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  MessageFlags
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
var embedThumbModal_default = commandModule({
  type: CommandType.Modal,
  name: "embedThumbnailModal",
  async execute(ctx) {
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found!",
        flags: MessageFlags.Ephemeral
      });
    }
    const url = ctx.fields.getTextInputValue("thumbnail_url");
    draft.embed.setThumbnail(url);
    draftCache.set(ctx.user.id, draft);
    const menuRow = buildFlowMenu(draft.flow);
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow]
    });
  }
});
export {
  embedThumbModal_default as default
};
