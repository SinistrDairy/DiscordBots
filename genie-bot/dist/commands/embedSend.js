import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import { MessageFlags } from "discord.js";
import { ThreadArchive } from "../models/ThreadArchive.js";
var embedSend_default = commandModule({
  type: CommandType.Button,
  name: "embed_post",
  async execute(ctx) {
    const userId = ctx.user.id;
    const draft = draftCache.get(userId);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found.",
        flags: MessageFlags.Ephemeral
      });
    }
    draftCache.delete(userId);
    const { embed, channelId, mention, flow } = draft;
    const rawChannel = ctx.guild?.channels.cache.get(channelId);
    if (!rawChannel || !rawChannel.isTextBased()) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> Invalid channel.",
        flags: MessageFlags.Ephemeral
      });
    }
    const channel = rawChannel;
    const sentMsg = await channel.send({
      content: mention,
      embeds: [embed],
      allowedMentions: { parse: ["users", "roles"] }
    });
    if (flow === "cow") {
      const noCustom = (embed.data.title ?? "").replace(/<a?:\w+:\d+>/g, "");
      const clean = noCustom.replace(/\p{Extended_Pictographic}/gu, "").trim();
      const threadName = clean.length > 0 ? clean : "Discussion";
      const thread = await sentMsg.startThread({
        name: threadName,
        autoArchiveDuration: 1440
        // 24h
      });
      const delayMs = draft.archiveDelayMs ?? 24 * 60 * 60 * 1e3;
      const archiveAt = new Date(Date.now() + delayMs);
      await ThreadArchive.create({
        threadId: thread.id,
        archiveAt
      });
      const cowRoleId = "1080548867390570496";
      const endTime = Math.floor((Date.now() + delayMs) / 1e3);
      await thread.send({
        content: `<:fk_colorsparkles:1367215313309138995> __**Congratulations, <@&${cowRoleId}>!**__ You've just won...a surprise Genie appearance!
-# *No refunds!*
This quest post ends <t:${endTime}:R>`,
        allowedMentions: { roles: [cowRoleId] }
      });
      const logsChannel = ctx.client.channels.cache.get(
        "1374746151688994816"
      );
      if (logsChannel?.isTextBased()) {
        const member = await ctx.guild?.members.fetch(userId);
        const name = member?.nickname || member?.user.displayName;
        await logsChannel.send(
          `<:v_genie:1376727510791880775> ${name} created the **${threadName}** thread in **${channel}**.`
        );
      }
    }
    await ctx.deleteReply().catch(() => {
    });
    await ctx.update({
      content: "<:v_genie:1376727510791880775> Embed posted!",
      embeds: [],
      components: []
    });
    setTimeout(() => {
      ctx.deleteReply().catch(() => {
      });
    }, 1e4);
  }
});
export {
  embedSend_default as default
};
