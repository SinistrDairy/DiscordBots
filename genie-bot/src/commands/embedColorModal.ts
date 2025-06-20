// src/events/embedColorModal.ts
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalSubmitInteraction,
  MessageFlags,
  ColorResolvable,
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";

export default commandModule({
  type: CommandType.Modal,
  name: "embedColorModal",


  async execute(ctx: ModalSubmitInteraction) {

    await ctx.deferReply({flags: MessageFlags.Ephemeral})
    const user = ctx.user.id
    // 1) Grab the draft
    const draft = draftCache.get(user);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found!",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 2) Pull and validate the hex code
    let color = ctx.fields.getTextInputValue("color").trim() as ColorResolvable;

    // 3) Apply it
    draft.embed.setColor(color);
    draftCache.set(user, draft);

    const menuRow = buildFlowMenu(draft.flow);
    // 5) Acknowledge & update the ephemeral preview
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow],
    });
  },
});
