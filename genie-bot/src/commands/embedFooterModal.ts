// src/events/embedFooterModal.ts
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
  name: "embedFooterModal",
  async execute(ctx: ModalSubmitInteraction) {
    // 1) Fetch the draft
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 2) Pull the footer text
    const text = ctx.fields.getTextInputValue("footer_text");
    draft.embed.setFooter({ text });
    draftCache.set(ctx.user.id, draft);

    const menuRow = buildFlowMenu(draft.flow);

    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow],
    });
  },
});
