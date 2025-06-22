import { EmbedBuilder, MessageFlags } from "discord.js";
import eventsSchema from "../../models/profiles/event-schema.js";

export const listOptions = []; // no extra options

export async function handleList(ctx: any) {
  const events = await eventsSchema.find({ serverID: ctx.guildId! }).lean();
  if (!events.length) {
    return ctx.reply({ content: "❌ No events found.", flags: MessageFlags.Ephemeral });
  }

  const description = events
    .map(e => `\`${e.name}\` • ${e.emojiID} **${e.title}**`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setTitle("📋 Events List")
    .setDescription(description)
    .setColor("Blue");

  return ctx.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
