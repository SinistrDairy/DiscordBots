// src/commands/event/eventTagsSelect.ts
import { commandModule, CommandType } from "@sern/handler";
import { StringSelectMenuInteraction, MessageFlags, TextChannel } from "discord.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";

export default commandModule({
  type: CommandType.StringSelect,
  name: "event_tags_select",
  async execute(ctx: StringSelectMenuInteraction) {
    // 1) Ack ephemerally
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    const id      = ctx.user.id;
    const draft   = eventDrafts.get(id)!;
    const choice  = ctx.values[0];

    // 2) Store the chosen role as a mention
    draft.tags = `<@&${choice}>`;
    eventDrafts.set(id, draft);

    // 3) Rebuild preview + return to your normal select‐menu flow
    const preview = await buildEventPreview(ctx, draft);
    const menuRow = buildKeyMenu(draft.key!);

    const channel = (await ctx.client.channels.fetch(draft.previewChannelId!)) as TextChannel;
    const msg     = await channel.messages.fetch(draft.previewMessageId!);
    await msg.edit({ ...preview, components: [menuRow] });

    // 4) Clean up stub
    return ctx.deleteReply();
  },
});
