import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import "dotenv/config";
import { Client } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

await rest.put(
  Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID1!),
  { body: [] }
);
console.log("✅ Cleared all guild commands for GUILD_ID1");

await rest.put(
  Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID2!),
  { body: [] }
);
console.log("✅ Cleared all guild commands for GUILD_ID2");
