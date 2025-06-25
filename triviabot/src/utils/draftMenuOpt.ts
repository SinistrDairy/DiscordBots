import type { APISelectMenuOption } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import type { DraftKey } from "./eventDraftCache.js"; // adjust the path as needed

/**
 * Centralized menu options per embed flow.
 */
export const menuOptions: Record<DraftKey, APISelectMenuOption[]> = {
  event: [
    { label: "Edit Title", value: "edit_title" },
    { label: "Edit Description", value: "edit_description" },
    { label: "Add Main Image", value: "add_image" },
    { label: "Add Emoji", value: "add_emoji" },
    { label: "Done Editing", value: "finalize" },
  ],
  special: [],
};

/**
 * Builds an ActionRow containing a select menu for the given flow.
 */
export function buildKeyMenu(key: DraftKey) {
  const opts = menuOptions[key] || [];
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${key}_page_select`)
    .setPlaceholder("Choose next step…")
    .addOptions(opts);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}