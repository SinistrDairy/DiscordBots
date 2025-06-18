import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../../utils/embedDraftCache.js";
import {
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
  StringSelectMenuBuilder
} from "discord.js";
var modEmbedMenu_default = commandModule({
  type: CommandType.StringSelect,
  name: "mod_embed_menu",
  async execute(ctx) {
    console.log(
      `[mod_embed_menu] select fired for user ${ctx.user.id}:`,
      ctx.values
    );
    const choice = ctx.values[0];
    const draft = draftCache.get(ctx.user.id);
    if (!draft)
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found.",
        flags: MessageFlags.Ephemeral
      });
    const updatePreview = async (components) => {
      await ctx.update({ embeds: [draft.embed], components });
    };
    switch (choice) {
      case "add_color": {
        const modal = new ModalBuilder().setCustomId("embedColorModal").setTitle("Edit Embed Color");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("color").setLabel("Hex Color Code (e.g. #52baff)").setPlaceholder("#52baff").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "add_thumbnail": {
        const modal = new ModalBuilder().setCustomId("embedThumbnailModal").setTitle("Add Thumbnail URL");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("thumbnail_url").setLabel("Thumbnail Image URL").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "add_image": {
        const modal = new ModalBuilder().setCustomId("embedImageModal").setTitle("Add Main Image URL");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("image_url").setLabel("Main Image URL").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "add_footer": {
        const modal = new ModalBuilder().setCustomId("embedFooterModal").setTitle("Add Footer");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("footer_text").setLabel("Footer Text").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );
        return ctx.showModal(modal);
      }
      case "add_emoji": {
        const opts = ctx.guild.emojis.cache.map((e) => ({
          label: e.name ?? e.id,
          // never null
          value: e.id,
          emoji: {
            id: e.id,
            name: e.name ?? void 0,
            // optional string
            animated: e.animated ?? void 0
            // optional boolean
          }
        })).slice(0, 25);
        const select = new StringSelectMenuBuilder().setCustomId("emoji_select").setPlaceholder("Pick a server emoji\u2026").addOptions(...opts);
        const row = new ActionRowBuilder().addComponents(select);
        return ctx.update({
          embeds: [draft.embed],
          components: [row.toJSON()]
        });
      }
      case "edit_description": {
        const current = draft.embed.data.description ?? "";
        const modal = new ModalBuilder().setCustomId("embedDescriptionModal").setTitle("Edit Description").addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("description_input").setLabel("Description").setStyle(TextInputStyle.Paragraph).setMaxLength(4e3).setRequired(false).setValue(current)
            // ← pre-fill with whatever they had
          )
        );
        return ctx.showModal(modal);
      }
      case "edit_title": {
        const current = draft.embed.data.title ?? "";
        const modal = new ModalBuilder().setCustomId("embedTitleModal").setTitle("Edit Title").addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("Title_input").setLabel("Title").setStyle(TextInputStyle.Paragraph).setMaxLength(256).setRequired(false).setValue(current)
            // ← pre-fill with whatever they had
          )
        );
        return ctx.showModal(modal);
      }
      case "finalize": {
        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("embed_post").setLabel("Post").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("embed_menu").setLabel("Edit").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("embed_cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
        );
        const rowData = actionRow.toJSON();
        return ctx.update({
          content: "**Preview** \u2014 ready to post or edit your embed.",
          embeds: [draft.embed],
          components: [rowData]
        });
      }
      default:
        return ctx.reply({
          content: "<:x_genie:1376727488822247444> Unknown option.",
          flags: MessageFlags.Ephemeral
        });
    }
  }
});
export {
  modEmbedMenu_default as default
};
