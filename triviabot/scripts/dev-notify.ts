// scripts/dev-notify.ts
import "dotenv/config";
import {Client, GatewayIntentBits, TextChannel} from 'discord.js'

async function main() {
  const { NODE_ENV, DEV_CHANNEL_ID, DISCORD_TOKEN } = process.env;
  if (NODE_ENV !== 'development' || !DEV_CHANNEL_ID || !DISCORD_TOKEN) {
    return;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.once('ready', async () => {
    try {
      const channel = await client.channels.fetch(DEV_CHANNEL_ID!) as TextChannel;
      if (channel && channel.isTextBased && channel.isTextBased()) {
        await channel.send('# Development Notice\n **Russell** is now in development, expect some instability.');
      } else {
        console.error(`Channel ${DEV_CHANNEL_ID} isn’t text-based`);
      }
    } catch (err) {
      console.error('Dev notice failed:', err);
    } finally {
      await client.destroy();
      process.exit(0);
    }
  });

  await client.login(DISCORD_TOKEN);
}

main();