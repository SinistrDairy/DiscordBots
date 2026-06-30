import { Client, EmbedBuilder } from "discord.js";
import VaultPlayer from "../models/vaultPlayer.js";
import VaultLeaderboard from "../models/vaultLeaderboard.js";

export async function updateLeaderboard(client: Client, guildId: string) {
  const board = await VaultLeaderboard.findOne({ guildId });
  if (!board) return;

  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(board.channelId);

  if (!channel || !channel.isTextBased()) return;

  let message;
  try {
    message = await channel.messages.fetch(board.messageId);
  } catch {
    return;
  }

  const players = await VaultPlayer.find({
    guildId,
    active: true,
  })
    .sort({ gold: -1, displayName: 1})
    .limit(15)
    .lean();

  const embed = new EmbedBuilder();

  if (players.length === 0) {
    embed.setDescription("No active players.");
    await message.edit({ embeds: [embed], content: "" });
    return;
  }

  const lines = players.map((player, index) => {
    const rank = `${index + 1}.`.padEnd(4, " ");
    const name = player.displayName.slice(0, 16).padEnd(16, " ");
    const gold = player.gold.toLocaleString().padStart(6, " ");

    return `${rank}${name}${gold}`;
  });

  embed
    .setDescription(
      `## <:t_gold:1478796803855089828> GOLD COUNT\n\`\`\`\n${lines.join("\n")}\n\`\`\``,
    )
    .setColor("#a16c2a")
    .setImage(
      "https://cdn.discordapp.com/attachments/801181759559172137/1485736832053416127/Copy_of_fk_embed_footers_2.png?ex=69c2f3c0&is=69c1a240&hm=affd0432277f86e90d634bfdd6a36d7e4f1aeca95506ed4eecbbcb81280af430&",
    );

  await message.edit({
    content: "",
    embeds: [embed],
  });
}
