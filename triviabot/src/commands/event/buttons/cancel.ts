// src/events/embedCancel.ts
import { commandModule, CommandType } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js"; // Adjust the path as necessary
import { ButtonInteraction, MessageFlags, TextChannel } from "discord.js";

export default commandModule({
  type: CommandType.Button,
  name: "cancel", // matches customId in your “Cancel” button
  async execute(ctx: ButtonInteraction) {
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    const channelId = ctx.channelId!;
    const messageId = ctx.message.id;

    // 3) Fetch & edit the original public message
    const channel = (await ctx.client.channels.fetch(
      channelId
    )) as TextChannel;
    const msg = await channel.messages.fetch(messageId);
    const updated = await msg.edit({
      content: "Drafts cleared. Workspace closing.",
      embeds: [],
      components: [],
    });
    setTimeout(async () => {
      updated.delete();
    }, 3_000);

    // 4) Clear out your draft cache if you like
    eventDrafts.delete(ctx.user.id);

    // 5) Remove the ephemeral stub
    return ctx.deleteReply();
  },
});
