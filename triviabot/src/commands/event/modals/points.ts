// src/commands/addEventModal_scoring.ts
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import { MessageFlags, TextChannel } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";

export default commandModule({
  name: "event_points",
  type: CommandType.Modal,
  async execute(ctx) {
    await ctx.deferReply({flags: MessageFlags.Ephemeral});
    const id = ctx.user.id;
    const draft = eventDrafts.get(id)!;

    // Each line is "Description, points"
    const raw = ctx.fields.getTextInputValue("pointList");
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // Store full lines for preview
    draft.pointList = lines;

    eventDrafts.set(id, draft);

    const preview = await buildEventPreview(ctx, draft);

    const menuRow = buildKeyMenu(draft.key!);
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
