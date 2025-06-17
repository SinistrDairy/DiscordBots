// src/utils/buildEventPreview.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
} from "discord.js";
import type { EventDraft } from "./eventDraftCache.js";

export async function buildEventPreview(ctx: any, draft: Partial<EventDraft>) {
  const e = draft;
  const lines: string[] = [];

  lines.push(`# __**EXAMPLE**__\n`);

  const title = `${draft.titleEmoji ?? ""} ${draft.title ?? "Untitled"} ${
    draft.titleEmoji ?? ""
  }`.trim();

  if (title) {
    lines.push(`## ${title}`, "");
  }

  lines.push("### __Rules__\n");
  for (const rule of draft.daRulez ?? []) {
    lines.push(`${draft.rulesEmoji ?? "-"} ${rule}`);
  }
  lines.push("");

  lines.push("__**Scoring**__\n");
  for (const entry of draft.scoring ?? []) {
    if (!entry.includes(",")) continue;
    const parts = entry.split(",").map((s) => s.trim());
    const pts = parts.pop()!;
    const desc = parts.join(", ");
    lines.push(`${desc}, ${pts} ${draft.jewelEmoji ?? ""}`);
  }
  lines.push("");

  const member = await ctx.guild?.members.fetch(ctx.user.id);
  lines.push("__**Hosting**__\n");
  lines.push(
    `<a:magicjewels:859867893587509298> Your host for today's game is: ${
      member?.displayName ?? ctx.user.username
    }`
  );
  lines.push("");

  lines.push("__**Tag**__\n");
  lines.push(draft.tags ?? "`No tag set.`");
  lines.push("");

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
