// src/commands/addEventPageSelect.ts
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ActionRowData,
  ButtonComponentData,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts, EventDraft } from "../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../utils/buildEventPreview.js";

export default commandModule({
  name: "event_page_select",
  type: CommandType.StringSelect,
  async execute(ctx) {
    const guild = ctx.guild!;
    const member = await guild.members.fetch(ctx.user.id);
    console.log(
      `[event_page_select] select fired for user ${member.displayName}`,
      ctx.values
    );
    const choice = ctx.values[0];
    const draft = eventDrafts.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:r_x:1376727384056922132> No draft found.",
        flags: MessageFlags.Ephemeral,
      });
    }

    switch (choice) {
      case "basic": {
        const modal = new ModalBuilder()
          .setCustomId("eventModal")
          .setTitle("Basic Info");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("name")
              .setLabel("Name")
              .setStyle(TextInputStyle.Short)
              .setValue(`${draft.name ?? ""}`)
              .setRequired(true)
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("title")
              .setLabel("Title")
              .setStyle(TextInputStyle.Short)
              .setValue(`${draft.title ?? ""}`)
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "rules": {
        const modal = new ModalBuilder()
          .setCustomId("addEventModal_rules") // ← this must match your handler’s name
          .setTitle("daRulez List");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("rules") // this key is what you read below
              .setLabel("Rules (one per line)")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(`${draft.daRulez?.join("\n") ?? ""}`)

              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "scoring": {
        const modal = new ModalBuilder()
          .setCustomId("addEventModal_scoring")
          .setTitle("Scoring");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("scoring")
              .setLabel("Each line: description")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(`${draft.scoring?.join("\n") ?? ""}`)
              .setPlaceholder(
                "The first person… will receive\n" +
                  "The second & third… will receive"
              )
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "points": {
        const modal = new ModalBuilder()
          .setCustomId("addEventModal_points")
          .setTitle("Points List");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("pointList")
              .setLabel("Points (one per line)")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(`${draft.pointList?.join("\n") ?? ""}`)
              .setPlaceholder("50\n100\n150")
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "finalize": {
        new ButtonBuilder()
          .setCustomId("save_event")
          .setLabel("Save")
          .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("edit_event") // go back into editing flow
            .setLabel("Edit")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
      }

      default:
        return ctx.reply({
          content: "<:r_x:1376727384056922132> Unknown section.",
          flags: MessageFlags.Ephemeral,
        });
    }
  },
});
