import "dotenv/config";
import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import * as path from "node:path";
import { Publisher } from "@sern/publisher";
import { startArchiveScheduler } from "./scheduler/archiveThreads.js";
import { disconnectDB } from "./db.js";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, "../package.json");
const { version } = JSON.parse(readFileSync(pkgPath, "utf-8"));
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
  commands: "dist/commands"
});
startArchiveScheduler(client);
client.once("ready", (c) => {
  console.log(`\u2705 ${c.user.tag} is online.`);
  client.user?.setActivity(`v.${version}`, {
    type: ActivityType.Streaming
  });
});
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
await client.login(process.env.DISCORD_TOKEN);
export {
  client
};
