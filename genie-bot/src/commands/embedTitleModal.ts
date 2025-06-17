import { commandModule, CommandType } from "@sern/handler";
import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import { draftCache } from "../utils/embedDraftCache.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";

export default commandModule({
  type: CommandType.Modal,
  name: "embedTitleModal",
  async execute(ctx: ModalSubmitInteraction) {
    const draft = draftCache.get(ctx.user.id)!;
    const updated = ctx.fields.getTextInputValue("title_input");
    draft.embed.setTitle(updated);
    draftCache.set(ctx.user.id, draft);

    const menuRow = buildFlowMenu(draft.flow);

    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow],
    });
  },
});
