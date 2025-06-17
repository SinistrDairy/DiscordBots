import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../../utils/embedDraftCache.js";
import {
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ActionRowData,
  ButtonComponentData,
  MessageFlags,
  StringSelectMenuBuilder,
} from "discord.js";

export default commandModule({
  type: CommandType.StringSelect,
  name: "admin_embed_menu",
  async execute(ctx) {
    console.log(
      `[admin_embed_menu] select fired for user ${ctx.user.id}:`,
      ctx.values
    );
    const choice = ctx.values[0];
    const draft = draftCache.get(ctx.user.id);
    if (!draft)
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found.",
        flags: MessageFlags.Ephemeral,
      });

    const updatePreview = async (
      components: ActionRowData<ButtonComponentData>[]
    ) => {
      await ctx.update({ embeds: [draft.embed], components });
    };

    switch (choice) {
      case "add_color": {
        const modal = new ModalBuilder()
          .setCustomId("embedColorModal")
          .setTitle("Edit Embed Color");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("color")
              .setLabel("Hex Color Code (e.g. #52baff)")
              .setPlaceholder("#52baff")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "add_thumbnail": {
        const modal = new ModalBuilder()
          .setCustomId("embedThumbnailModal")
          .setTitle("Add Thumbnail URL");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("thumbnail_url")
              .setLabel("Thumbnail Image URL")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "add_image": {
        const modal = new ModalBuilder()
          .setCustomId("embedImageModal")
          .setTitle("Add Main Image URL");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("image_url")
              .setLabel("Main Image URL")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "add_footer": {
        const modal = new ModalBuilder()
          .setCustomId("embedFooterModal")
          .setTitle("Add Footer");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("footer_text")
              .setLabel("Footer Text")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "add_fields": {
        const modal = new ModalBuilder()
          .setCustomId("embedFieldsModal")
          .setTitle("Add Fields");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("fields_json")
              .setLabel("Fields JSON")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }

      case "toggle_timestamp": {
        // flip the flag
        draft.timestamp = !draft.timestamp;
        if (draft.timestamp) {
          draft.embed.setTimestamp();
        } else {
          // remove the timestamp field entirely
          // EmbedBuilder.data is the underlying API payload
          // @ts-ignore – we know `data` has a `timestamp` prop
          delete draft.embed.data.timestamp;
        }
        draftCache.set(ctx.user.id, draft);

        // rebuild the same “Choose next step…” select menu
        const menuRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("admin_embed_menu")
              .setPlaceholder("Choose next step…")
              .addOptions([
                { label: "Add Color", value: "add_color" },
                { label: "Add Thumbnail", value: "add_thumbnail" },
                { label: "Add Emoji", value: "add_emoji" },
                { label: "Add Main Image", value: "add_image" },
                { label: "Edit Description", value: "edit_description" },
                { label: "Add Footer", value: "add_footer" },
                { label: "Add Fields", value: "add_fields" },
                { label: "Toggle Timestamp", value: "toggle_timestamp" },
                { label: "Done Editing", value: "finalize" },
              ])
          );

        // cast to ActionRowData so TypeScript is happy
        const menuData =
          menuRow.toJSON() as unknown as ActionRowData<ButtonComponentData>;

        // update the ephemeral message with the refreshed embed + menu
        return ctx.update({
          embeds: [draft.embed],
          components: [menuData],
        });
      }
      case "add_emoji": {
        // build up to 25 guild-emoji options:
        const opts = ctx
          .guild!.emojis.cache.map((e) => ({
            label: e.name ?? e.id, // never null
            value: e.id,
            emoji: {
              id: e.id,
              name: e.name ?? undefined, // optional string
              animated: e.animated ?? undefined, // optional boolean
            },
          }))
          .slice(0, 25);

        // 2) spread the array into addOptions()
        const select = new StringSelectMenuBuilder()
          .setCustomId("emoji_select")
          .setPlaceholder("Pick a server emoji…")
          .addOptions(...opts);

        const row =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        return ctx.update({
          embeds: [draft.embed],
          components: [row.toJSON() as any],
        });
      }

      case "edit_description": {
        const current = draft.embed.data.description ?? "";

        const modal = new ModalBuilder()
          .setCustomId("embedDescriptionModal")
          .setTitle("Edit Description")
          .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("description_input")
                .setLabel("Description")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(4000)
                .setRequired(false)
                .setValue(current) // ← pre-fill with whatever they had
            )
          );

        return ctx.showModal(modal);
      }

      case "edit_title": {
        const current = draft.embed.data.title ?? "";

        const modal = new ModalBuilder()
          .setCustomId("embedTitleModal")
          .setTitle("Edit Title")
          .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("Title_input")
                .setLabel("Title")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(256)
                .setRequired(false)
                .setValue(current) // ← pre-fill with whatever they had
            )
          );

        return ctx.showModal(modal);
      }

      case "finalize": {
        // Show final preview with Post / Edit / Cancel
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("embed_post")
            .setLabel("Post")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("embed_menu") // go back into editing flow
            .setLabel("Edit")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("embed_cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
        );

        const rowData =
          actionRow.toJSON() as unknown as ActionRowData<ButtonComponentData>;

        return ctx.update({
          content: "**Preview** — ready to post or edit your embed.",
          embeds: [draft.embed],
          components: [rowData],
        });
      }

      default:
        return ctx.reply({
          content: "<:x_genie:1376727488822247444> Unknown option.",
          flags: MessageFlags.Ephemeral,
        });
    }
  },
});
