import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
async function buildEventPreview(ctx, draft) {
  const lines = [];
  lines.push("# __**EXAMPLE**__", "");
  if (draft.name) {
    lines.push(`-# name: **${draft.name}**`, "");
  }
  if (draft.eventEmoji) {
    lines.push(`-# event emoji: ${draft.eventEmoji}`, "");
  }
  if (draft.title) {
    lines.push(`## ${draft.title}`, "");
  }
  lines.push("### __Rules__", "");
  for (const rule of draft.daRulez ?? []) {
    const bullet = draft.rulesEmoji ?? "-";
    lines.push(`${bullet} ${rule}`);
  }
  lines.push("");
  lines.push("__**Scoring**__", "");
  for (const entry of draft.scoring ?? []) {
    lines.push(entry);
  }
  lines.push("");
  if (draft.pointList?.length) {
    lines.push("__**Points**__", "");
    lines.push(draft.pointList.join(", "));
    lines.push("");
  }
  const member = await ctx.guild?.members.fetch(ctx.user.id);
  lines.push("__**Hosting**__", "");
  lines.push(
    `<a:magicjewels:859867893587509298> Your host for today's game is: ${member?.displayName ?? ctx.user.username}`
  );
  lines.push("");
  lines.push("__**Tag**__", "");
  lines.push(draft.tags ?? "`No tag set.`");
  lines.push("");
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("preview_submit").setLabel("Submit").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("preview_edit").setLabel("Edit").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("preview_cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
  );
  return {
    content: lines.join("\n"),
    embeds: [],
    components: [row]
  };
}
export {
  buildEventPreview
};
