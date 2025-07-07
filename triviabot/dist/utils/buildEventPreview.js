import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
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
    lines.push(`## ${draft.eventEmoji} ${draft.title} ${draft.eventEmoji}`, "");
  }
  lines.push("### __Rules__", "");
  for (const rule of draft.daRulez ?? []) {
    const bullet = draft.rulesEmoji ?? "-";
    lines.push(`${bullet} ${rule}`);
  }
  lines.push("");
  lines.push("__**Scoring**__", "");
  const scoringArr = draft.scoring ?? [];
  const pointsArr = draft.pointList ?? [];
  const dotEmoji = "<:fk_dot:1334970932657131560>";
  const jewelEmoji = "<:fk_jewel:1333402533439475743>";
  function shouldSkipLine(raw) {
    const trimmed = raw.trim();
    if (trimmed.toLowerCase().endsWith("as follows:"))
      return true;
    if (trimmed.toLowerCase().endsWith(jewelEmoji))
      return true;
    const tokens = trimmed.split(/\s+/);
    const lastToken = tokens[tokens.length - 1] || "";
    const unwrapped = lastToken.replace(/^[_*~`]+|[_*~`]+$/g, "");
    return /^(\d+)(?:\/\d+)*$/.test(unwrapped);
  }
  let pIdx = 0;
  scoringArr.forEach((raw) => {
    const text = raw.trim();
    if (shouldSkipLine(text)) {
      lines.push(`${dotEmoji} ${text}`);
    } else if (pIdx < pointsArr.length) {
      const pts = pointsArr[pIdx++];
      lines.push(`${dotEmoji} ${text} __**${pts}**__ ${jewelEmoji}`);
    } else {
      lines.push(`${dotEmoji} ${text}`);
    }
  });
  lines.push("");
  if (draft.pointList?.length) {
    lines.push("__**Points**__", "");
    lines.push(draft.pointList.join(", "));
    lines.push("");
  }
  const member = await ctx.guild?.members.fetch(ctx.user.id);
  lines.push("__**Hosting**__", "");
  lines.push(
    `<a:magicjewels:859867893587509298> Your host for today's game is: ${member?.displayName}`
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
    components: [row]
  };
}
export {
  buildEventPreview
};
