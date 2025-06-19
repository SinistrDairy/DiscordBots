import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import { startArchiveScheduler } from "./scheduler/archiveThreads.js";
import { connectDB, disconnectDB } from "./db.js";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

await makeDependencies(({ add }) => {
  add("@sern/client", () => client);
  add(
    "publisher",
    (deps) =>
      new Publisher(
        deps["@sern/modules"],
        deps["@sern/emitter"],
        deps["@sern/logger"]!
      )
  );
});

Sern.init({
  defaultPrefix: "$",
  commands: "dist/commands",
});
// --- START the archive scheduler here ---
startArchiveScheduler(client);

// Finally, log in your bot
await client.login(process.env.DISCORD_TOKEN);
console.log("✅ Bot logged in");

process.on("SIGINT", async () => {
  console.log("SIGINT—disconnecting DB");
  await disconnectDB();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("SIGTERM—disconnecting DB");
  await disconnectDB();
  process.exit(0);
});
