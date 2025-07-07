// src/utils/buildEventPreview.ts
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { EventDraft } from "./eventDraftCache.js";

export async function buildEventPreview(ctx: any, draft: Partial<EventDraft>) {
  const lines: string[] = [];

  // ── HEADER ─────────────────────────────────────────────────────────────
  lines.push("# __**EXAMPLE**__", "");

  // ── NAME (optional) ────────────────────────────────────────────────────
  if (draft.name) {
    lines.push(`-# name: **${draft.name}**`, "");
  }
  if (draft.eventEmoji) {
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
  const dotEmoji = "<:fk_dot:1334970932657131560>";
  const jewelEmoji = "<:fk_jewel:1333402533439475743>";

  function shouldSkipLine(raw: string): boolean {
    const trimmed = raw.trim();
    // 1) literal skip-phrase (case-insensitive)
    if (trimmed.toLowerCase().endsWith("as follows:")) return true;

    if(trimmed.toLowerCase().endsWith(jewelEmoji)) return true;

    // 2) grab the very last “word”
    const tokens = trimmed.split(/\s+/);
    const lastToken = tokens[tokens.length - 1] || "";

    // strip markdown wrappers (* _ ~ `)
    const unwrapped = lastToken.replace(/^[_*~`]+|[_*~`]+$/g, "");

    // match either a pure number (e.g. "42") or a ratio ("75/25", "3/2/1", etc)
    return /^(\d+)(?:\/\d+)*$/.test(unwrapped);
  }

  let pIdx = 0;
  scoringArr.forEach((raw) => {
    const text = raw.trim();
    if (shouldSkipLine(text)) {
      // just the raw rule, no point‐attach
      lines.push(`${dotEmoji} ${text}`);
    } else if (pIdx < pointsArr.length) {
      // attach the next point value
      const pts = pointsArr[pIdx++];
      lines.push(`${dotEmoji} ${text} __**${pts}**__ ${jewelEmoji}`);
    } else {
      // fallback if points run out
      lines.push(`${dotEmoji} ${text}`);
    }
  });

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
    `<a:magicjewels:859867893587509298> Your host for today's game is: ${member?.displayName}`
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
