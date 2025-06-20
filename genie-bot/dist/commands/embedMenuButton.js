import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  MessageFlags
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
var embedMenuButton_default = commandModule({
  type: CommandType.Button,
  name: "embed_menu",
  // matches your Edit button's customId
  async execute(ctx) {
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({ content: "\u26A0\uFE0F No draft found!", flags: MessageFlags.Ephemeral });
    }
    const menuRow = buildFlowMenu(draft.flow);
    return ctx.update({
      content: "",
      // clear the “Preview” text if you like
      embeds: [draft.embed],
      components: [menuRow]
    });
  }
});
export {
  embedMenuButton_default as default
};
