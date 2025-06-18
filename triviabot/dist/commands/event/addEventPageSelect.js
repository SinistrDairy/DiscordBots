import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../utils/eventDraftCache.js";
var addEventPageSelect_default = commandModule({
  name: "add-event-page",
  type: CommandType.StringSelect,
  async execute(ctx) {
    const choice = ctx.values[0];
    const draft = eventDrafts.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "\u274C No draft found. Start with `/add-event` first.",
        flags: MessageFlags.Ephemeral
      });
    }
    switch (choice) {
      case "basic": {
        const modal = new ModalBuilder().setCustomId("eventModal").setTitle("Basic Info");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("name").setLabel("Name").setStyle(TextInputStyle.Short).setValue(`${draft.name ?? ""}`).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("title").setLabel("Title").setStyle(TextInputStyle.Short).setValue(`${draft.title ?? ""}`).setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "rules": {
        const modal = new ModalBuilder().setCustomId("addEventModal_rules").setTitle("daRulez List");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("rules").setLabel("Rules (one per line)").setStyle(TextInputStyle.Paragraph).setValue(`${draft.daRulez?.join("\n") ?? ""}`).setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "scoring": {
        const modal = new ModalBuilder().setCustomId("addEventModal_scoring").setTitle("Scoring & Points");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("scoring").setLabel("Each line: description, points").setStyle(TextInputStyle.Paragraph).setValue(`${draft.scoring?.join("\n") ?? ""}`).setPlaceholder(
              "The first person\u2026 will receive, 100\nThe second & third\u2026 will receive, 50"
            ).setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      default:
        return ctx.reply({
          content: "\u274C Unknown section.",
          flags: MessageFlags.Ephemeral
        });
    }
  }
});
export {
  addEventPageSelect_default as default
};
