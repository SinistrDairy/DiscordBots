// src/events/adminEmbedModal.ts
import {
  EmbedBuilder,
  ThreadChannel,
  TextChannel,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../../utils/embedDraftCache.js";
import { buildFlowMenu } from "../../utils/embedMenuOpt.js";

export default commandModule({
  type: CommandType.Modal,
  name: "adminEmbedModal",
  async execute(ctx) {
    console.log(`[adminEmbedModal] Modal submitted! user=${ctx.user.id}`);

    try {
      // 1) Retrieve the draft we stashed in Step 1
      const draft = draftCache.get(ctx.user.id);
      console.log(draft);
      if (!draft) {
        return ctx.reply({
          content: "<:x_genie:1376727488822247444> No draft found.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // 2) Only pull the fields we actually requested in this modal
      const title = ctx.fields.getTextInputValue("title");
      const description = ctx.fields.getTextInputValue("description");

      // 3) Build the base embed (we'll add color, images, etc. in later steps)
      draft.embed
        .setTitle(title)
        .setDescription(description)
        .setColor("#52baff"); // default color
      draft.timestamp = false; // reset timestamp

      draftCache.set(ctx.user.id, draft);

      const menuRow = buildFlowMenu(draft.flow);
      await ctx.deferReply({ flags: MessageFlags.Ephemeral });

      await ctx.editReply({
        embeds: [draft.embed],
        components: [menuRow],
      });

      return;
    } catch (err) {
      console.error("[adminEmbedModal] error:", err);
      return ctx.reply({
        content:
          "<:x_genie:1376727488822247444> Something went wrong processing your embed draft.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
