// src/events/embedImageModal.ts
import { commandModule, CommandType } from "@sern/handler";
import { draftCache, type EmbedFlow } from "../utils/embedDraftCache.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalSubmitInteraction,
  MessageFlags,
} from "discord.js";

export default commandModule({
  type: CommandType.Modal,
  name: "embedImageModal",
  async execute(ctx: ModalSubmitInteraction) {

    // 2) Fetch the draft
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.editReply({
        content: "<:x_genie:1376727488822247444> No draft found!",
      });
    }

    // 3) Extract & apply the URL
    const url = ctx.fields.getTextInputValue("image_url");
    draft.embed.setImage(url);
    draftCache.set(ctx.user.id, draft);

    const menuRow = buildFlowMenu(draft.flow);

    // 5) Update the same ephemeral with new embed + menu
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow],
    });
  },
});
