import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
import {
  MessageFlags
} from "discord.js";
var embedImageModal_default = commandModule({
  type: CommandType.Modal,
  name: "embedImageModal",
  async execute(ctx) {
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.editReply({
        content: "<:x_genie:1376727488822247444> No draft found."
      });
    }
    const url = ctx.fields.getTextInputValue("image_url");
    draft.embed.setImage(url);
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
  embedImageModal_default as default
};
