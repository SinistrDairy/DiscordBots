import { commandModule, CommandType } from "@sern/handler";
import {
  MessageFlags
} from "discord.js";
import { draftCache } from "../utils/embedDraftCache.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
var emojiSelect_default = commandModule({
  type: CommandType.StringSelect,
  name: "emoji_select",
  async execute(ctx) {
    const draft = draftCache.get(ctx.user.id);
    const emojiId = ctx.values[0];
    const emoji = ctx.guild.emojis.cache.get(emojiId);
    draft.embed.setDescription(
      `${emoji.toString()} ${draft.embed.data.description}`
    );
    draftCache.set(ctx.user.id, draft);
    const menuRow = buildFlowMenu(draft.flow);
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow]
    });
  }
});
export {
  emojiSelect_default as default
};
