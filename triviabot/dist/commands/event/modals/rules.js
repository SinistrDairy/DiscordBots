import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";
var rules_default = commandModule({
  name: "event_rules",
  type: CommandType.Modal,
  async execute(ctx) {
    await ctx.deferReply();
    try {
      const userId = ctx.user.id;
      const draft = eventDrafts.get(userId) ?? {
        serverID: ctx.guildId
      };
      const raw = ctx.fields.getTextInputValue("rules");
      draft.daRulez = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      eventDrafts.set(userId, draft);
      const preview = await buildEventPreview(ctx, draft);
      const menuRow = buildKeyMenu(draft.key);
      const channel = await ctx.client.channels.fetch(
        draft.previewChannelId
      );
      const msg = await channel.messages.fetch(draft.previewMessageId);
      await msg.edit({
        ...preview,
        components: [menuRow]
      });
      return ctx.deleteReply();
    } catch (error) {
      console.error("error:", error);
      return ctx.reply({
        content: "<:r_x:1376727384056922132> Oops, could not save your rules\u2014please try again.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
export {
  rules_default as default
};
