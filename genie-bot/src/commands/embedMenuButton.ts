// src/events/embedMenuButton.ts
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  ButtonInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ActionRowData,
  ButtonComponentData,
  MessageFlags,
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";

export default commandModule({
  type: CommandType.Button,
  name: "embed_menu", // matches your Edit button's customId
  async execute(ctx: ButtonInteraction) {
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({ content: "⚠️ No draft found!", flags: MessageFlags.Ephemeral });
    }

    const menuRow = buildFlowMenu(draft.flow);

    // update the same ephemeral message
    return ctx.update({
      content: "", // clear the “Preview” text if you like
      embeds: [draft.embed],
      components: [menuRow],
    });
  },
});
