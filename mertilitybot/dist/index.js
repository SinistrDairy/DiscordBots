import "dotenv/config";
import * as config from "./config.js";
import { Client } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
const client = new Client({
  intents: [
    // GatewayIntentBits.Guilds,
    // GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent, //Make sure this is enabled for text commands!
  ]
  // partials: [Partials.Channel],
});
await makeDependencies(({ add }) => {
  add("@sern/client", client);
  add("publisher", (deps) => new Publisher(
    deps["@sern/modules"],
    deps["@sern/emitter"],
    deps["@sern/logger"]
  ));
});
Sern.init(config);
await client.login(process.env.DISCORD_TOKEN);
