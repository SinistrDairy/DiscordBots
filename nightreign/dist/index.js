import "dotenv/config";
import * as config from "./config.js";
import { Client, GatewayIntentBits } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import mongo from "mongoose";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
    // Required for text command parsing
  ]
});
await makeDependencies(({ add }) => {
  add("@sern/client", client);
  add(
    "publisher",
    (deps) => new Publisher(
      deps["@sern/modules"],
      deps["@sern/emitter"],
      deps["@sern/logger"]
    )
  );
});
Sern.init(config);
client.on("ready", async (c) => {
  await mongo.connect(process.env.MONGOURI);
  const connStatus = mongo.connection.readyState;
  if (connStatus == 1) {
    console.log(`${c.user.username} has connected.`);
  } else {
    console.log(`Status is ${connStatus}`);
  }
});
try {
  await client.login(process.env.DISCORD_TOKEN);
} catch (err) {
  console.error("\u274C Failed to login:", err);
}
