// src/utils/buildEventPreview.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { EventDraft } from "./eventDraftCache.js";

export async function buildEventPreview(
  ctx: any,
  draft: Partial<EventDraft>
) {
  const lines: string[] = [];

  // ── HEADER ─────────────────────────────────────────────────────────────
  lines.push("# __**EXAMPLE**__", "");

  // ── NAME (optional) ────────────────────────────────────────────────────
  if (draft.name) {
    lines.push(`-# name: **${draft.name}**`, "");
  }
  if(draft.eventEmoji){
    lines.push(`-# event emoji: ${draft.eventEmoji}`, "");
  }

  // ── TITLE ──────────────────────────────────────────────────────────────
  // draft.title includes your embedded emojis already
  if (draft.title) {
    lines.push(`## ${draft.eventEmoji} ${draft.title} ${draft.eventEmoji}`, "");
  }

  // ── RULES ──────────────────────────────────────────────────────────────
  lines.push("### __Rules__", "");
  for (const rule of draft.daRulez ?? []) {
    // if you have a rulesEmoji in draft, you can prefix it here:
    const bullet = draft.rulesEmoji ?? "-";
    lines.push(`${bullet} ${rule}`);
  }
  lines.push("");

  // ── SCORING ────────────────────────────────────────────────────────────
  lines.push("__**Scoring**__", "");
  const scoringArr = draft.scoring ?? [];
  const pointsArr = draft.pointList ?? [];
  const skipPhrase = "as follows:"
  const len = Math.min(scoringArr.length, pointsArr.length);
  const jewelEmoji = `<:fk_jewel:1333402533439475743>`
  let ptI = 0;

  for (let i = 0; i < len; i++){
    const description = scoringArr[i].trim();
    
    if(description.endsWith(skipPhrase)) 
      { lines.push(`${description}`)
    continue;}
    
    const points = pointsArr[ptI++];
    lines.push(`<:fk_dot:1334970932657131560> ${description}, __**${points}**__ ${jewelEmoji}`)
  }
  lines.push("");

  // ── POINTS LIST ────────────────────────────────────────────────────────
  if (draft.pointList?.length) {
    lines.push("__**Points**__", "");
    lines.push(draft.pointList.join(", "));
    lines.push("");
  }

  // ── HOSTING ────────────────────────────────────────────────────────────
  const member = await ctx.guild?.members.fetch(ctx.user.id);
  lines.push("__**Hosting**__", "");
  lines.push(
    `<a:magicjewels:859867893587509298> Your host for today's game is: ${
      member?.displayName
    }`
  );
  lines.push("");

  // ── TAG ────────────────────────────────────────────────────────────────
  lines.push("__**Tag**__", "");
  lines.push(draft.tags ?? "`No tag set.`");
  lines.push("");

  // ── ACTION BUTTONS ─────────────────────────────────────────────────────
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("preview_submit")
      .setLabel("Submit")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("preview_edit")
      .setLabel("Edit")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("preview_cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger)
  );

  return {
    content: lines.join("\n"),
    components: [row],
  };
}
