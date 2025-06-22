import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import mongoose from "mongoose";
import userSchema from "./models/profiles/user-schema.js";
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
  commands: "dist/commands",
  events: "dist/events"
});
await mongoose.connect(process.env.MONGOURI);
if (mongoose.connection.readyState !== 1) {
  console.error("\u274C Mongo failed to connect:", mongoose.connection.readyState);
  process.exit(1);
}
client.once("ready", (c) => {
  console.log(`\u2705 ${c.user.tag} is online.`);
  client.user?.setActivity(`Version ${version}`, {
    type: ActivityType.Playing
  });
});
client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.guild || !msg.member)
    return;
  const LAND_ROLE_IDS = [
    "830604135748337678",
    "830604878190870538",
    "830604824763695124",
    "1324823193789272146",
    "1324823285904707707",
    "1324823449197215908"
  ];
  const landNames = msg.member.roles.cache.filter((r) => LAND_ROLE_IDS.includes(r.id)).map((r) => r.name.toLowerCase());
  const land = landNames.length > 0 ? landNames.join(", ") : "unassigned";
  try {
    await userSchema.updateOne(
      { userID: msg.author.id },
      {
        $setOnInsert: {
          userName: msg.author.username,
          nickName: msg.member.displayName,
          land,
          totalPoints: 0,
          events: [
            { name: "trivia", firsts: 0, seconds: 0, thirds: 0 },
            { name: "pop quiz", firsts: 0, seconds: 0, thirds: 0 },
            { name: "misc", firsts: 0, seconds: 0, thirds: 0 }
          ],
          serverID: msg.guildId
        }
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("Profile upsert error:", err);
  }
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
await client.login(process.env.DISCORD_TOKEN);
