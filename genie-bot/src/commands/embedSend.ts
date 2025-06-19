// src/events/embedPost.ts
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import { ButtonInteraction, TextChannel, MessageFlags } from "discord.js";
import { ThreadArchive } from "../models/ThreadArchive.js";

export default commandModule({
  type: CommandType.Button,
  name: "embed_post",
  async execute(ctx: ButtonInteraction) {
    const userId = ctx.user.id;
    const draft = draftCache.get(userId);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // remove it immediately so it can’t be reused
    draftCache.delete(userId);

    const { embed, channelId, mention, flow } = draft;
    const rawChannel = ctx.guild?.channels.cache.get(channelId);
    if (!rawChannel || !rawChannel.isTextBased()) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> Invalid channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const channel = rawChannel as TextChannel;


    const sentMsg = await channel.send({
      content: mention,
      embeds: [embed],
      allowedMentions: { parse: ["users", "roles"] },
    });

    if (flow === "cow") {
      // strip custom Discord emojis
      const noCustom = (embed.data.title ?? "").replace(/<a?:\w+:\d+>/g, "");
      // strip Unicode emoji
      const clean = noCustom.replace(/\p{Extended_Pictographic}/gu, "").trim();
      const threadName = clean.length > 0 ? clean : "Discussion";

      // start the thread and capture it
      const thread = await sentMsg.startThread({
        name: threadName,
        autoArchiveDuration: 1440, // 24h
      });

      const delayMs = draft.archiveDelayMs ?? 24 * 60 * 60 * 1000;
      const archiveAt = new Date(Date.now() + delayMs)
      await ThreadArchive.create({
        data: {
          threadId: thread.id,
          archiveAt: archiveAt,
        },
      });
      
      // now send a “ping” inside the thread to pull people in
      const cowRoleId = "1080548867390570496";
      const endTime = Math.floor((Date.now() + delayMs) / 1000)
      await thread.send({
        content: `Hey <@&${cowRoleId}>, event ends in <t:${endTime}:R>`,
        allowedMentions: { roles: [cowRoleId] },
      });

      // log thread creation as before…
      const logsChannel = ctx.client.channels.cache.get(
        "1374746151688994816"
      ) as TextChannel;
      if (logsChannel?.isTextBased()) {
        const member = await ctx.guild?.members.fetch(userId);
        const name = member?.nickname || member?.user.username;
        await logsChannel.send(
          `<:v_genie:1376727510791880775> ${name} created the **${threadName}** thread in ${channel}.`
        );
      }
    }

    // 4) Remove the old ephemeral preview (if any)
    await ctx.deleteReply().catch(() => {});

    // 5) Update the interaction to confirm success
    await ctx.update({
      content: "<:v_genie:1376727510791880775> Embed posted!",
      embeds: [],
      components: [],
    });

    // 6) Auto-delete that confirmation after 10s
    setTimeout(() => {
      ctx.deleteReply().catch(() => {});
    }, 10_000);
  },
});
