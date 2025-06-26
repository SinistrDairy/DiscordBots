import { commandModule, CommandType } from "@sern/handler";
import {
  ModalSubmitInteraction,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";

export default commandModule({
  type: CommandType.Modal,
  name: "search_event_emoji", // must match your modal’s customId
  async execute(ctx: ModalSubmitInteraction) {
    try {
      // 1) ACK the modal so Discord knows you got it
      await ctx.deferReply({ flags: MessageFlags.Ephemeral });

      // 2) Pull the term and filter emojis
      const term = ctx.fields.getTextInputValue("emoji_search").toLowerCase();
      const matches = ctx
        .guild!.emojis.cache.filter((e) => e.name?.includes(term))
        .first(25);

      if (!matches.length) {
        return ctx.editReply({ content: "No matching emojis found." });
      }

      // 3) Build a <select> of up to 25
      const opts = matches.map((e) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(e.name!)
          .setValue(e.id)
          .setEmoji({
            id: e.id,
            name: e.name!,
            animated: e.animated ?? undefined,
          })
      );
      const menu = new StringSelectMenuBuilder()
        .setCustomId("event_e_emoji_select")
        .setPlaceholder("Pick event emoji…")
        .addOptions(...opts);
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        menu
      );

      // 4) Edit your one public preview message
      const draft = eventDrafts.get(ctx.user.id)!;
      const preview = await buildEventPreview(ctx, draft);
      const channel = (await ctx.client.channels.fetch(
        draft.previewChannelId!
      )) as TextChannel;
      const msg = await channel.messages.fetch(draft.previewMessageId!);
      await msg.edit({ ...preview, components: [row] });

      // 5) Clean up the ephemeral stub
      return ctx.deleteReply();
    } catch (err) {
      console.error(err);
      // If deferral succeeded, use editReply; otherwise fallback to reply()
      if (ctx.deferred || ctx.replied) {
        return ctx.editReply({ content: "❌ Something went wrong." });
      } else {
        return ctx.reply({
          content: "❌ Something went wrong.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
});
