import type { APISelectMenuOption } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import type { EmbedFlow } from "./embedDraftCache.js"; // adjust the path as needed

/**
 * Centralized menu options per embed flow.
 */
export const menuOptions: Record<EmbedFlow, APISelectMenuOption[]> = {
  cow: [
    { label: "Edit Title", value: "edit_title" },
    { label: "Edit Description", value: "edit_description" },
    { label: "Add Main Image", value: "add_image" },
    { label: "Add Emoji", value: "add_emoji" },
    { label: "Done Editing", value: "finalize" },
  ],
  admin: [],
  mod: []
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