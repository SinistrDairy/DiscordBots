import "dotenv/config";
import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import mongoose from "mongoose";
import userSchema from "./models/profiles/user-schema.js";

// load version from package.json
const { version } = await import("../package.json", {
  assert: { type: "json" },
});

// ———— build your Discord client ————
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// ———— wire up Sern dependencies & commands/events ————
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
  commands: "dist/commands",
  events: "dist/events",
});

// ———— connect MongoDB once at startup ————
await mongoose.connect(process.env.MONGOURI!);
if (mongoose.connection.readyState !== 1) {
  console.error("❌ Mongo failed to connect:", mongoose.connection.readyState);
  process.exit(1);
}

// ———— single ready handler ————
client.once("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
  client.user?.setActivity(`Version ${version}`, {
    type: ActivityType.Playing,
  });
});

// ———— message handler with upsert ————
client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.guild || !msg.member) return;

  // collect “land” roles
  const LAND_ROLE_IDS = [
    "830604135748337678",
    "830604878190870538",
    "830604824763695124",
    "1324823193789272146",
    "1324823285904707707",
    "1324823449197215908",
  ];
  const landNames = msg.member.roles.cache
    .filter((r) => LAND_ROLE_IDS.includes(r.id))
    .map((r) => r.name);

  // default if none
  const land = landNames.length > 0 ? landNames.join(", ").toLowerCase() : "Unassigned";

  try {
    // upsert: only insert when missing
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
            { name: "misc", firsts: 0, seconds: 0, thirds: 0 },
          ],
          serverID: msg.guildId,
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("Profile upsert error:", err);
  }
});

// ———— catch-all rejection logging ————
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// ———— finally, log in ————
await client.login(process.env.DISCORD_TOKEN);
