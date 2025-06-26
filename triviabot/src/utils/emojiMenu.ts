import { StringSelectMenuBuilder } from "discord.js";

const PER_PAGE = 25;

export function buildEmojiMenu(allEmojis: { label:string, value:string }[], page = 0) {
  const start = page * PER_PAGE;
  const slice = allEmojis.slice(start, start + PER_PAGE);

  // Add navigation entries if needed
  if (page > 0) slice.unshift({ label: "⬅️ Prev", value: `__PAGE__${page-1}` });
  if (start + PER_PAGE < allEmojis.length)
    slice.push({ label: "➡️ Next", value: `__PAGE__${page+1}` });

  return new StringSelectMenuBuilder()
    .setCustomId(`emoji_page_${page}`)
    .setPlaceholder(`Choose emoji (page ${page+1})`)
    .setOptions(slice);
}