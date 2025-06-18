import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
const menuOptions = {
  admin: [
    { label: "Edit Title", value: "edit_title" },
    { label: "Edit Description", value: "edit_description" },
    { label: "Add Color", value: "add_color" },
    { label: "Add Thumbnail", value: "add_thumbnail" },
    { label: "Add Emoji", value: "add_emoji" },
    { label: "Add Main Image", value: "add_image" },
    { label: "Add Footer", value: "add_footer" },
    { label: "Add Fields", value: "add_fields" },
    { label: "Toggle Timestamp", value: "toggle_timestamp" },
    { label: "Done Editing", value: "finalize" }
  ],
  mod: [
    { label: "Edit Title", value: "edit_title" },
    { label: "Edit Description", value: "edit_description" },
    { label: "Add Thumbnail", value: "add_thumbnail" },
    { label: "Add Main Image", value: "add_image" },
    { label: "Add Emoji", value: "add_emoji" },
    { label: "Done Editing", value: "finalize" }
  ],
  cow: [
    { label: "Edit Title", value: "edit_title" },
    { label: "Edit Description", value: "edit_description" },
    { label: "Add Main Image", value: "add_image" },
    { label: "Add Emoji", value: "add_emoji" },
    { label: "Done Editing", value: "finalize" }
  ]
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
