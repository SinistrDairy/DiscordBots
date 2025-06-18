import {
  MessageFlags
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../../utils/embedDraftCache.js";
import { buildFlowMenu } from "../../utils/embedMenuOpt.js";
var adminEmbedModal_default = commandModule({
  type: CommandType.Modal,
  name: "adminEmbedModal",
  async execute(ctx) {
    console.log(`[adminEmbedModal] Modal submitted! user=${ctx.user.id}`);
    try {
      const draft = draftCache.get(ctx.user.id);
      console.log(draft);
      if (!draft) {
        return ctx.reply({
          content: "<:x_genie:1376727488822247444> No draft found.",
          flags: MessageFlags.Ephemeral
        });
      }
      const title = ctx.fields.getTextInputValue("title");
      const description = ctx.fields.getTextInputValue("description");
      draft.embed.setTitle(title).setDescription(description).setColor("#52baff");
      draft.timestamp = false;
      draftCache.set(ctx.user.id, draft);
      const menuRow = buildFlowMenu(draft.flow);
      await ctx.deferReply({ flags: MessageFlags.Ephemeral });
      await ctx.editReply({
        embeds: [draft.embed],
        components: [menuRow]
      });
      return;
    } catch (err) {
      console.error("[adminEmbedModal] error:", err);
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> Something went wrong processing your embed draft.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
export {
  adminEmbedModal_default as default
};
