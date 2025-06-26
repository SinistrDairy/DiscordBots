import { commandModule, CommandType } from "@sern/handler";
import { MessageFlags, ModalSubmitInteraction, TextChannel } from "discord.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";

export default commandModule({
  type: CommandType.Modal,
  name: "basic_info", // your modal’s customId
  async execute(ctx: ModalSubmitInteraction) {
    // 1) Public defer (no flags)
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    // 2) Update our in‐memory draft
    const draft = eventDrafts.get(ctx.user.id)!;
    draft.name = ctx.fields.getTextInputValue("name_input");
    draft.title = ctx.fields.getTextInputValue("title_input");
    eventDrafts.set(ctx.user.id, draft);

    // 3) Rebuild preview + menu row
    const preview = await buildEventPreview(ctx, draft);
    const menuRow = buildKeyMenu(draft.key!);
    // 4) Fetch the ORIGINAL public message & edit it
    const channel = (await ctx.client.channels.fetch(
      draft.previewChannelId!
    )) as TextChannel;
    const msg = await channel.messages.fetch(draft.previewMessageId!);
    await msg.edit({
      ...preview,
      components: [menuRow],
    });

    // 5) Clean up the ephemeral stub so *no* second message ever appears
    return ctx.deleteReply();
  },
});
