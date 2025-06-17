import type { APISelectMenuOption } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import type { EmbedFlow } from "./embedDraftCache.js"; // adjust the path as needed

/**
 * Centralized menu options per embed flow.
 */
export const menuOptions: Record<EmbedFlow, APISelectMenuOption[]> = {
  admin: [
    { label: "Edit Title",        value: "edit_title" },
    { label: "Edit Description",  value: "edit_description" },
    { label: "Add Color",         value: "add_color" },
    { label: "Add Thumbnail",     value: "add_thumbnail" },
    { label: "Add Emoji",         value: "add_emoji" },
    { label: "Add Main Image",    value: "add_image" },
    { label: "Add Footer",        value: "add_footer" },
    { label: "Add Fields",        value: "add_fields" },
    { label: "Toggle Timestamp",  value: "toggle_timestamp" },
    { label: "Done Editing",      value: "finalize" },
  ],
  mod: [
    { label: "Edit Title",        value: "edit_title" },
    { label: "Edit Description",  value: "edit_description" },
    { label: "Add Thumbnail",     value: "add_thumbnail" },
    { label: "Add Main Image",    value: "add_image" },
    { label: "Add Emoji",         value: "add_emoji" },
    { label: "Done Editing",      value: "finalize" },
  ],
  cow: [
    { label: "Edit Title",        value: "edit_title" },
    { label: "Edit Description",  value: "edit_description" },
    { label: "Add Main Image",    value: "add_image" },
    { label: "Add Emoji",         value: "add_emoji" },
    { label: "Done Editing",      value: "finalize" },
  ],
};

/**
 * Builds an ActionRow containing a select menu for the given flow.
 */
export function buildFlowMenu(flow: EmbedFlow) {
  const opts = menuOptions[flow] || [];
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${flow}_embed_menu`)
    .setPlaceholder("Choose next step…")
    .addOptions(opts);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}