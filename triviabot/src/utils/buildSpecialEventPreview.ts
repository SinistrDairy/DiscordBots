// src/utils/buildSpecialEventPreview.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ColorResolvable,
} from "discord.js";
import type { EventDraft } from "./eventDraftCache.js";

export async function buildSpecialEventPreview(
  ctx: any,
  draft: Partial<EventDraft>
) {
  // Destructure the special‐only fields you saved
  const {
    title,
    color,
    howToPlay = [],
    daRulez = [],
    scoring = [],
    pointList = [],
    eventEmoji = "",
    rulesEmoji = "",
    mImage = "",
    fImage = "",
    hEmojiID = "",
    tags = "",
  } = draft;

  // helper to prefix each line with the given emoji
  const formatBlock = (lines: string[], emoji: string) =>
    lines.map((l) => `${emoji} ${l}`).join("\n");

  const howToBlock = formatBlock(howToPlay, hEmojiID);
  const rulesBlock = formatBlock(daRulez, rulesEmoji);

  // build the scoring section
  const skipPhrase = "as follows:";
  const jewelEmoji = `<:fk_jewel:1333402533439475743>`;
  const dotEmoji = "<:fk_dot:1334970932657131560>";
  let scoreBlock = "";
  for (let i = 0, ptI = 0; i < scoring.length; ++i) {
    const desc = scoring[i].trim();
    if (desc.endsWith(skipPhrase)) {
      scoreBlock += `${desc}\n`;
      continue;
    }
    const pts = pointList[ptI++]?.trim() ?? "0";
    scoreBlock += `${dotEmoji} ${desc} — **${pts}** ${jewelEmoji}\n`;
  }

  // build the embed exactly like your start‐command
  const embed = new EmbedBuilder()
    .setTitle(`${eventEmoji} ${title!.toUpperCase()}`)
    .setDescription(
      `*Refreshed and ready for fun!*\n\n` +
        `**How to play:**\n${howToBlock}\n\n` +
        `**Rules:**\n${rulesBlock}\n\n` +
        `**Scores:**\n${scoreBlock}`
    )
    .setColor(color as ColorResolvable)
    .setImage(fImage);

  // two buttons: Post or Cancel
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("preview_submit")
      .setLabel("Post")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("preview_cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger)
  );

  // content above embed: the tag(s) and the banner image
  return {
    content: `${tags}\n${mImage}`,
    embeds: [embed],
    components: [row],
  };
}
