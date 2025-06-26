// src/commands/event/modals/searchTagsModal.ts
import { commandModule, CommandType } from "@sern/handler";
import {
  ModalSubmitInteraction,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";

export default commandModule({
  type: CommandType.Modal,
  name: "search_tags",      // must match setCustomId above
  async execute(ctx: ModalSubmitInteraction) {
    // 1) Ack ephemerally
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    // 2) Filter roles by the user’s input
    const term = ctx.fields.getTextInputValue("tags_search").toLowerCase();
    const matches = ctx.guild!.roles.cache
      .filter((r) => r.name.toLowerCase().includes(term))
      .map((r) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(r.name)
          .setValue(r.id)
      )
      .slice(0, 25);

    if (matches.length === 0) {
      return ctx.editReply({ content: "No matching roles found." });
    }

    // 3) Build your select menu of roles
    const menu = new StringSelectMenuBuilder()
      .setCustomId("event_tags_select")
      .setPlaceholder(`Pick a role to tag…`)
      .addOptions(...matches);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    // 4) Update the one public preview message
    const draft   = eventDrafts.get(ctx.user.id)!;
    const preview = await buildEventPreview(ctx, draft);
    const channel = (await ctx.client.channels.fetch(draft.previewChannelId!)) as TextChannel;
    const msg     = await channel.messages.fetch(draft.previewMessageId!);
    await msg.edit({ ...preview, components: [row] });

    // 5) Clean up our ephemeral stub
    return ctx.deleteReply();
  },
});
