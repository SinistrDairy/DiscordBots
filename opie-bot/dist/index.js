import "dotenv/config.js";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import bProfile from "./models/profiles/bprof-Schema.js";
import mongo from "mongoose";
import { Publisher } from "@sern/publisher";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
    //Make sure this is enabled for text commands!
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
  // removing defaultPrefix will shut down text commands
  commands: "dist/commands"
  // events: 'dist/events', //(optional)
});
client.on("ready", async (c) => {
  await mongo.connect(process.env.MONGOURI);
  const connStatus = mongo.connection.readyState;
  if (connStatus == 1) {
    console.log(`${c.user.username} has connected.`);
  } else {
    console.log(`Status is ${connStatus}`);
  }
});
client.on("messageCreate", async (message) => {
  if (message.author.bot)
    return;
  const target = message.member;
  let profileData;
  try {
    profileData = await bProfile.findOne({ userID: message.author.id });
    if (!profileData) {
      let profile = await bProfile.create({
        userName: target.user.username,
        userID: target.user.id,
        bLetters: "",
        bShapes: [],
        shapes: [],
        letters: [],
        serverID: message.guildId
      });
      profile.save();
    }
  } catch (err) {
    console.log(err);
    console.log("this error");
  }
});
await client.login(process.env.DISCORD_TOKEN);
