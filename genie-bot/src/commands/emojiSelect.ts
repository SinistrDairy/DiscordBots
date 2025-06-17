import { commandModule, CommandType } from "@sern/handler";
import {
  ActionRowBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { draftCache } from "../utils/embedDraftCache.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";

export default commandModule({
  type: CommandType.StringSelect,
  name: "emoji_select",
  async execute(ctx: StringSelectMenuInteraction) {
    const draft = draftCache.get(ctx.user.id)!;
    const emojiId = ctx.values[0];
    const emoji = ctx.guild!.emojis.cache.get(emojiId)!;

    // do whatever you want with it — for example prepend it to your title:
    draft.embed.setDescription(
      `${emoji.toString()} ${draft.embed.data.description}`
    );
    draftCache.set(ctx.user.id, draft);

    const menuRow = buildFlowMenu(draft.flow);
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow],
    });
  },
});
