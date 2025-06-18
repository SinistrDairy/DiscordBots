import { commandModule, CommandType } from "@sern/handler";
import { MessageFlags } from "discord.js";
import { draftCache } from "../utils/embedDraftCache.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
var embedDescriptionModal_default = commandModule({
  type: CommandType.Modal,
  name: "embedDescriptionModal",
  async execute(ctx) {
    const draft = draftCache.get(ctx.user.id);
    const updated = ctx.fields.getTextInputValue("description_input");
    draft.embed.setDescription(updated);
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
  embedDescriptionModal_default as default
};
