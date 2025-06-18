import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import { PrismaClient } from "@prisma/client";
import { startArchiveScheduler } from "./scheduler/archiveThreads.js";
const prisma = new PrismaClient();
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
process.on("SIGINT", () => prisma.$disconnect());
process.on("SIGTERM", () => prisma.$disconnect());
await client.login(process.env.DISCORD_TOKEN);
export {
  client
};
