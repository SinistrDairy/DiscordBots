import { commandModule, CommandType } from "@sern/handler";
import { MessageFlags, TextChannel } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";

export default commandModule({
  type: CommandType.StringSelect,
  name: "event_r_emoji_select",
  async execute(ctx) {
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    const id = ctx.user.id;
    const draft = eventDrafts.get(id)!;
    const choice = ctx.values[0];
    const emoji = ctx.guild!.emojis.cache.get(choice);
    if (!emoji) {
      return ctx.editReply({ content: "⚠️ I couldn't find that emoji." });
    }
    // assign and reset any page/state if you had it
    draft.rulesEmoji = emoji.toString();
    eventDrafts.set(id, draft);

    // re-render
    const preview = await buildEventPreview(ctx, draft);
    const menuRow = buildKeyMenu(draft.key!);
    const channel = (await ctx.client.channels.fetch(
      draft.previewChannelId!
    )) as TextChannel;
    const msg = await channel.messages.fetch(draft.previewMessageId!);
    await msg.edit({ ...preview, components: [menuRow] });

    return ctx.deleteReply();
  },
});
