import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  MessageFlags
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
var embedColorModal_default = commandModule({
  type: CommandType.Modal,
  name: "embedColorModal",
  async execute(ctx) {
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    const user = ctx.user.id;
    const draft = draftCache.get(user);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found.",
        flags: MessageFlags.Ephemeral
      });
    }
    let color = ctx.fields.getTextInputValue("color").trim();
    draft.embed.setColor(color);
    draftCache.set(user, draft);
    const menuRow = buildFlowMenu(draft.flow);
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow]
    });
  }
});
export {
  embedColorModal_default as default
};
