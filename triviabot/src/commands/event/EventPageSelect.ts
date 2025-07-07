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
  ActionRow,
  StringSelectMenuBuilder,
  TextChannel,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts, EventDraft } from "../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../utils/buildEventPreview.js";
import searchEventEmojiModal from "./modals/searchEventEmojiModal.js";

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
          .setCustomId("basic_info")
          .setTitle("Basic Info");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("name_input")
              .setLabel("Name")
              .setStyle(TextInputStyle.Short)
              .setValue(`${draft.name ?? ""}`)
              .setRequired(true)
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("title_input")
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
          .setCustomId("event_rules") // ← this must match your handler’s name
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
          .setCustomId("event_scoring")
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
          .setCustomId("event_points")
          .setTitle("Points List");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("pointList")
              .setLabel("Points (one per line)")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(`${draft.pointList?.join("\n") ?? ""}`)
              .setPlaceholder("150\n100\n50")
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "evEmSel": {
        // 2) Build & show a one‐field modal
        const modal = new ModalBuilder()
          .setCustomId("search_event_emoji")
          .setTitle("Search Event Emoji");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("emoji_search")
              .setLabel("Type part of the emoji name")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("e.g. soccer")
              .setRequired(true)
          )
        );

        return ctx.showModal(modal);
      }

      case "rulezEmSel": {
        // 2) Build & show a one‐field modal
        const modal = new ModalBuilder()
          .setCustomId("search_rules_emoji")
          .setTitle("Search Rules Emoji");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("rEmoji_search")
              .setLabel("Type part of the emoji name")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("e.g. arrow")
              .setRequired(true)
          )
        );

        return ctx.showModal(modal);
      }
      case "tags": {
        // pop open a one‐field modal for role search
        const modal = new ModalBuilder()
          .setCustomId("search_tags")
          .setTitle("Search Tags");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("tags_search")
              .setLabel("Type part of the role name")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("e.g. Moderator")
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "finalize": {
        // ephemeral stub
        await ctx.deferReply({});

        // build your Save/Edit/Cancel buttons
        const saveBtn = new ButtonBuilder()
          .setCustomId("save_event")
          .setLabel("Save")
          .setStyle(ButtonStyle.Success);
        const editBtn = new ButtonBuilder()
          .setCustomId("edit_event")
          .setLabel("Edit")
          .setStyle(ButtonStyle.Secondary);
        const cancelBtn = new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger);
        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          saveBtn,
          editBtn,
          cancelBtn
        );
        const rowData =
          buttonRow.toJSON() as ActionRowData<ButtonComponentData>;

        // build the preview embed/buttons payload
        const previewPayload = await buildEventPreview(ctx, draft);

        if (!draft.previewMessageId) {
          // ──────────── CREATE FLOW ────────────
          const sent = await ctx.followUp({
            ...previewPayload,
            components: [rowData],
            ephemeral: true,
          });
          // store for future edits
          draft.previewMessageId = sent.id;
          draft.previewChannelId = ctx.channelId!;
          eventDrafts.set(ctx.user.id, draft);
          return;
        } else {
          // ──────────── EDIT FLOW ────────────
          const channel = (await ctx.client.channels.fetch(
            draft.previewChannelId!
          )) as TextChannel;
          const msg = await channel.messages.fetch(draft.previewMessageId!);
          await msg.edit({
            ...previewPayload,
            components: [rowData],
          });
          // clean up the ephemeral stub
          return ctx.deleteReply();
        }
      }

      default:
        return ctx.reply({
          content: "<:r_x:1376727384056922132> Unknown section.",
          flags: MessageFlags.Ephemeral,
        });
    }
  },
});
