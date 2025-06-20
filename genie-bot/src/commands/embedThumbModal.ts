// src/events/embedThumbnailModal.ts
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalSubmitInteraction,
  MessageFlags,
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";

export default commandModule({
  type: CommandType.Modal,
  name: "embedThumbnailModal",
  async execute(ctx: ModalSubmitInteraction) {
    // 1) Fetch the draft
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found!",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 2) Extract the URL
    const url = ctx.fields.getTextInputValue("thumbnail_url");

    // 3) Apply to the embed
    draft.embed.setThumbnail(url);
    draftCache.set(ctx.user.id, draft);

    const menuRow = buildFlowMenu(draft.flow);
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow],
    });
  },
});
