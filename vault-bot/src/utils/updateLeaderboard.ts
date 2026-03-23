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
    .sort({ gold: -1 })
    .limit(15)
    .lean();

  const embed = new EmbedBuilder();

  if (players.length === 0) {
    embed.setDescription("No active players.");
    await message.edit({ embeds: [embed], content: "" });
    return;
  }

  const names: string[] = [];
  const gold: string[] = [];

  players.forEach((player) => {
    names.push(`${player.displayName}`);
    gold.push(`${player.gold.toLocaleString()}`);
  });

  embed
    .setDescription(`## <:t_gold:1478796803855089828> GOLD COUNT`)
    .setColor("#a16c2a")
    .addFields(
      {
        name: "Name",
        value: names.join("\n"),
        inline: true,
      },
      {
        name: "Gold",
        value: gold.join("\n"),
        inline: true,
      }
    )
    .setImage("https://cdn.discordapp.com/attachments/801181759559172137/1485736832053416127/Copy_of_fk_embed_footers_2.png?ex=69c2f3c0&is=69c1a240&hm=affd0432277f86e90d634bfdd6a36d7e4f1aeca95506ed4eecbbcb81280af430&")

  await message.edit({
    content: "",
    embeds: [embed],
  });
}