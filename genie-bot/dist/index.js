import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import { startArchiveScheduler } from "./scheduler/archiveThreads.js";
import { disconnectDB } from "./db.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});
await makeDependencies(({ add }) => {
  add("@sern/client", () => client);
  add(
    "publisher",
    (deps) => new Publisher(
      deps["@sern/modules"],
      deps["@sern/emitter"],
      deps["@sern/logger"]
    )
  );
});
Sern.init({
  defaultPrefix: "$",
  commands: "dist/commands"
});
startArchiveScheduler(client);
await client.login(process.env.DISCORD_TOKEN);
console.log("\u2705 Bot logged in");
process.on("SIGINT", async () => {
  console.log("SIGINT\u2014disconnecting DB");
  await disconnectDB();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("SIGTERM\u2014disconnecting DB");
  await disconnectDB();
  process.exit(0);
});
export {
  client
};
