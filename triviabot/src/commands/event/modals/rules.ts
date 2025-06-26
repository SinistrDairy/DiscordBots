// src/commands/addEventModal_rules.ts
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts, EventDraft } from "../../../utils/eventDraftCache.js";
import { MessageFlags, TextChannel } from "discord.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
import { buildKeyMenu } from "../../../utils/draftMenuOpt.js";

export default commandModule({
  name: "event_rules", 
  type: CommandType.Modal,
  async execute(ctx) {
    await ctx.deferReply();
    try {
      const userId = ctx.user.id;
      // If there’s no draft yet, create a fresh one (so you don’t get undefined)
      const draft: Partial<EventDraft> = eventDrafts.get(userId) ?? {
        serverID: ctx.guildId!,
      };

      // Grab the text box value
      const raw = ctx.fields.getTextInputValue("rules");
      // Split on newlines into an array
      draft.daRulez = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      eventDrafts.set(userId, draft as EventDraft);

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
    } catch (error) {
      console.error("error:", error);
      return ctx.reply({
        content:
          "<:r_x:1376727384056922132> Oops, could not save your rules—please try again.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
