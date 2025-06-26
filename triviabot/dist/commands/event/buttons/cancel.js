import { commandModule, CommandType } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";
var cancel_default = commandModule({
  type: CommandType.Button,
  name: "cancel",
  // matches customId in your “Cancel” button
  async execute(ctx) {
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    const channelId = ctx.channelId;
    const messageId = ctx.message.id;
    const channel = await ctx.client.channels.fetch(
      channelId
    );
    const msg = await channel.messages.fetch(messageId);
    const updated = await msg.edit({
      content: "Drafts cleared. Workspace closing.",
      embeds: [],
      components: []
    });
    setTimeout(async () => {
      updated.delete();
    }, 3e3);
    eventDrafts.delete(ctx.user.id);
    return ctx.deleteReply();
  }
});
export {
  cancel_default as default
};
