//src/index.ts

import "dotenv/config";
import * as config from "./config.js";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import { connectMongo } from "./database/mongo.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, //Make sure this is enabled for text commands!
  ],
  partials: [Partials.Channel]
});

const mongoose = await connectMongo();


await makeDependencies(({ add }) => {
  add("@sern/client", client);

  add(
    "publisher",
    (deps) =>
      new Publisher(
        deps["@sern/modules"],
        deps["@sern/emitter"],
        deps["@sern/logger"]!,
      ),
  );
});

//View docs for all options
Sern.init(config);

client.once("clientReady", (client) => {
  console.log(`🤖 Discord client logged in as ${client.user.tag}`);
});

await client.login(process.env.DISCORD_TOKEN);
