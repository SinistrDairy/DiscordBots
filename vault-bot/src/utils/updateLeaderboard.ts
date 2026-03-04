import { Client } from "discord.js";
import VaultPlayer from "../models/vaultPlayer.js";
import VaultLeaderboard from "../models/vaultLeaderboard.js";

export async function updateLeaderboard(client: Client, guildId: string) {

  const board = await VaultLeaderboard.findOne({ guildId });

  if (!board) return;

  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(board.channelId);

  if (!channel || !channel.isTextBased()) return;

  const message = await channel.messages.fetch(board.messageId);

  const players = await VaultPlayer.find({
    guildId,
    active: true
  })
  .sort({ gold: -1 })
  .lean();

  if (!players.length) {
    await message.edit("No active players.");
    return;
  }

  const lines = players.map((p, i) => {
    return `${i + 1}. ${p.displayName} — ${p.gold}`;
  });

  const output = lines.join("\n");

  await message.edit(output);
}