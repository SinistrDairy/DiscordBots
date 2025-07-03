// src/commands/modals/basicInfo.ts
import { commandModule, CommandType } from "@sern/handler";
import {
  ModalSubmitInteraction,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";

export default commandModule({
  type: CommandType.Modal,
  name: "basic_info",
  async execute(ctx: ModalSubmitInteraction) {
    // 1) Defer publicly (no flags)
    await ctx.deferReply();

    // 2) Update draft
    const draft = eventDrafts.get(ctx.user.id)!;
    draft.name = ctx.fields.getTextInputValue("name_input");
    draft.title = ctx.fields.getTextInputValue("title_input");
    eventDrafts.set(ctx.user.id, draft);

    // 3) Build preview embed & menu
    const preview = await buildEventPreview(ctx, draft);
    const menuRow = buildKeyMenu(draft.key!);

    if (!draft.previewMessageId) {
      // ─── First‐time (create) ───
      const sent = await ctx.followUp({
        ...preview,
        components: [menuRow],
        ephemeral: false, // ensure public
      });
      draft.previewChannelId = ctx.channelId!;
      draft.previewMessageId = sent.id;
      eventDrafts.set(ctx.user.id, draft);

      return;
    } else {
      // ─── Editing existing preview ───
      const channel = (await ctx.client.channels.fetch(
        draft.previewChannelId!
      )) as TextChannel;
      const msg = await channel.messages.fetch(draft.previewMessageId!);
      await msg.edit({
        ...preview,
        components: [menuRow],
      });
      return;
    }
  },
});
