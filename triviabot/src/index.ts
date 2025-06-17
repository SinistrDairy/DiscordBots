import "dotenv/config";
import { Client, EmbedBuilder, GatewayIntentBits, Partials, TextChannel } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import userSchema from "./models/profiles/user-schema.js";
import mongo from "mongoose";
import { Publisher } from "@sern/publisher";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, //Make sure this is enabled for text commands!
  ],
  partials: [Partials.Channel],
});

/**
 * Where all of your dependencies are composed.
 * '@sern/client' is usually your Discord Client.
 * Use this function to access all of your dependencies.
 * This is used for external event modules as well
 */
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
//View docs for all options
Sern.init({
  commands: "dist/commands",
  events: 'dist/events', //(optional)
});

client.on("ready", async (c) => {
  await mongo.connect(process.env.MONGOURI!);
  const connStatus = mongo.connection.readyState;
  if (connStatus == 1) {
    console.log(`${c.user.username} has connected.`);
  } else {
    console.log(`Status is ${connStatus}`);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const target = message.member!;
  const roleIds = new Set([
    "830604135748337678",
    "830604878190870538",
    "830604824763695124",
    "1324823193789272146",
    "1324823285904707707",
    "1324823449197215908",
  ]);
  const roles = target.roles.cache.filter((r) => roleIds.has(r.id));
  const landName = roles.map((r) => r.name).toString();

  let profileData;
  try {
    profileData = await userSchema.findOne({ userID: message.author.id });
    if (!profileData) {
      let profile = await userSchema.create({
        userName: message.author.username,
        userID: message.author.id,
        nickName: message.member?.displayName,
        land: landName,
        totalPoints: 0,
        events: [
          { name: "trivia", firsts: 0, seconds: 0, thirds: 0 },
          { name: "pop quiz", firsts: 0, seconds: 0, thirds: 0 },
          { name: "misc", firsts: 0, seconds: 0, thirds: 0 },
        ],
        serverID: message.guildId,
      });
      profile.save();
    }
  } catch (err) {
    console.log(err);
    console.log("this error");
  }
});

client.on("error", (err) => {
  console.error("Discord client error:", err);
});

// And catch any unhandled promise rejections:
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

await client.login(process.env.DISCORD_TOKEN);
