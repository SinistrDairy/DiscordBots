import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  TextChannel,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";

export default commandModule({
  name: "edit_event",
  type: CommandType.Button,
  async execute(ctx) {
    await ctx.deferReply();
    const draft = eventDrafts.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:r_x:1376727384056922132> No draft found.",
        flags: MessageFlags.Ephemeral,
      });
    }

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
