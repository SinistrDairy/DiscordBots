import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import { PrismaClient } from "@prisma/client";
import { startArchiveScheduler } from "./scheduler/archiveThreads.js";

const prisma = new PrismaClient();

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

// Graceful shutdown for Prisma
process.on("SIGINT", () => prisma.$disconnect());
process.on("SIGTERM", () => prisma.$disconnect());

// Finally, log in your bot
await client.login(process.env.DISCORD_TOKEN);
