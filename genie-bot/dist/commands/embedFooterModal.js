import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  MessageFlags
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
var embedFooterModal_default = commandModule({
  type: CommandType.Modal,
  name: "embedFooterModal",
  async execute(ctx) {
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found!",
        flags: MessageFlags.Ephemeral
      });
    }
    const text = ctx.fields.getTextInputValue("footer_text");
    draft.embed.setFooter({ text });
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
  embedFooterModal_default as default
};
