import {
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../../utils/buildEventPreview.js";
var edit_default = commandModule({
  name: "preview_edit",
  type: CommandType.Button,
  async execute(ctx) {
    const draft = eventDrafts.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "\u274C No draft found. Start with `/event-management` first.",
        ephemeral: true
      });
    }
    const preview = await buildEventPreview(ctx, draft);
    const menu = new StringSelectMenuBuilder().setCustomId("add-event-page").setPlaceholder("Choose a section to fill").addOptions([
      { label: "Basic Info", value: "basic" },
      { label: "Rules", value: "rules" },
      { label: "Scoring & Points", value: "scoring" }
    ]);
    const extendedComponents = [
      ...preview.components,
      new ActionRowBuilder().addComponents(menu)
    ];
    return ctx.update({
      content: preview.content,
      embeds: preview.embeds,
      components: extendedComponents
    });
  }
});
export {
  edit_default as default
};
