// src/events/adminEmbedModal.ts
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../../utils/embedDraftCache.js";
import { buildFlowMenu } from "../../utils/embedMenuOpt.js";

export default commandModule({
  type: CommandType.Modal,
  name: "cowEmbedModal",
  async execute(ctx) {
    console.log(`[cowEmbedModal] Modal submitted! user=${ctx.user.id}`);

    try {
      // 1) Retrieve the draft we stashed in Step 1
      const draft = draftCache.get(ctx.user.id);
      if (!draft) {
        return ctx.reply({
          content: "<:x_genie:1376727488822247444> No draft found.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // 2) Only pull the fields we actually requested in this modal
      const title = ctx.fields.getTextInputValue("title_input");
      const description = ctx.fields.getTextInputValue("description_input");
      const defaultJewels = 50;
      const jewelsRaw = ctx.fields.getTextInputValue("jewels");
      const jewelsPer = Number.parseInt(jewelsRaw, 10);
      const finalJewels = Number.isNaN(jewelsPer) ? defaultJewels : jewelsPer;

      // 3) Build the base embed (we'll add color, images, etc. in later steps)
      draft.embed
        .setTitle(title)
        .setDescription(description)
        .setFields({
          name: `\u200b`,
          value: `<:fk_star_bullet_y:1377710982302011532> This Quest Post is worth __**${finalJewels}**__ <:fk_jewel:1333402533439475743>`
        })
        .setColor("#52baff"); // default color
      draft.timestamp = true; // reset timestamp

      draftCache.set(ctx.user.id, draft);

      const menuRow = buildFlowMenu(draft.flow);

      await ctx.deferReply({ flags: MessageFlags.Ephemeral });

      await ctx.editReply({
        embeds: [draft.embed],
        components: [menuRow],
      });

      return;
    } catch (err) {
      console.error("[modEmbedModal] error:", err);
      return ctx.reply({
        content:
          "<:x_genie:1376727488822247444> Something went wrong processing your embed draft.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
