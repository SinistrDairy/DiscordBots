import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";

export default commandModule({
  name: "preview_edit",
  type: CommandType.Button,
  async execute(ctx) {
    const draft = eventDrafts.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "❌ No draft found. Start with `/event-management` first.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const preview = await buildEventPreview(ctx, draft);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("add-event-page")
      .setPlaceholder("Choose a section to fill")
      .addOptions([
        { label: "Basic Info", value: "basic" },
        { label: "Rules", value: "rules" },
        { label: "Scoring & Points", value: "scoring" },
      ]);

    // Add the select menu row below the buttons
    const extendedComponents = [
      ...preview.components,
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
    ];

    return ctx.update({
      content: preview.content,
      embeds: preview.embeds,
      components: extendedComponents,
    });
  },
});
