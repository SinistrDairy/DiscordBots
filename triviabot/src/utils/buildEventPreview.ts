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
    lines.push(`## ${draft.title}`, "");
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
  for (const entry of draft.scoring ?? []) {
    // now every DB entry shows up, unmodified
    lines.push(entry);
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
      member?.displayName ?? ctx.user.username
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
    embeds: [],
    components: [row],
  };
}
