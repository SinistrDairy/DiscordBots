import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
const menuOptions = {
  cow: [
    { label: "Edit Title", value: "edit_title" },
    { label: "Edit Description", value: "edit_description" },
    { label: "Add Main Image", value: "add_image" },
    { label: "Add Emoji", value: "add_emoji" },
    { label: "Done Editing", value: "finalize" }
  ],
  admin: [],
  mod: []
};
function buildFlowMenu(flow) {
  const opts = menuOptions[flow] || [];
  const menu = new StringSelectMenuBuilder().setCustomId(`${flow}_embed_menu`).setPlaceholder("Choose next step\u2026").addOptions(opts);
  return new ActionRowBuilder().addComponents(menu);
}
export {
  buildFlowMenu,
  menuOptions
};
