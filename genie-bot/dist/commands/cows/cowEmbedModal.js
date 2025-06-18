import {
  MessageFlags
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../../utils/embedDraftCache.js";
import { buildFlowMenu } from "../../utils/embedMenuOpt.js";
var cowEmbedModal_default = commandModule({
  type: CommandType.Modal,
  name: "cowEmbedModal",
  async execute(ctx) {
    console.log(`[cowEmbedModal] Modal submitted! user=${ctx.user.id}`);
    try {
      const draft = draftCache.get(ctx.user.id);
      if (!draft) {
        return ctx.reply({
          content: "<:x_genie:1376727488822247444> No draft found.",
          flags: MessageFlags.Ephemeral
        });
      }
      const title = ctx.fields.getTextInputValue("title");
      const description = ctx.fields.getTextInputValue("description");
      const defaultJewels = 50;
      const jewelsRaw = ctx.fields.getTextInputValue("jewels");
      const jewelsPer = Number.parseInt(jewelsRaw, 10);
      const finalJewels = Number.isNaN(jewelsPer) ? defaultJewels : jewelsPer;
      draft.embed.setTitle(title).setDescription(description).setFields({
        name: `\u200B`,
        value: `<:fk_star_bullet_y:1377710982302011532> This quest post is worth __**${finalJewels}**__ <:fk_jewel:1333402533439475743>`
      }).setColor("#52baff");
      draft.timestamp = true;
      draftCache.set(ctx.user.id, draft);
      const menuRow = buildFlowMenu(draft.flow);
      await ctx.deferReply({ flags: MessageFlags.Ephemeral });
      await ctx.editReply({
        embeds: [draft.embed],
        components: [menuRow]
      });
      return;
    } catch (err) {
      console.error("[modEmbedModal] error:", err);
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> Something went wrong processing your embed draft.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
export {
  cowEmbedModal_default as default
};
