import "dotenv/config.js";
import { Client, GatewayIntentBits, MessageFlags, Partials } from "discord.js";
import { Sern, makeDependencies } from "@sern/handler";
import bProfile from "./models/profiles/bprof-Schema.js";
import { handleBirthdayButtons } from "./utils/Birthday/birthday-buttons.js";
import { runBirthdayAnnouncer } from "./utils/Birthday/birthday-announcer.js";
import cron from "node-cron";
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
function ts() {
  const d = new Date(
    (/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const YYYY = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}`;
}
client.on("ready", async (c) => {
  await mongo.connect(process.env.MONGOURI);
  const connStatus = mongo.connection.readyState;
  if (connStatus == 1) {
    console.log(`${ts()} -> ${c.user.username} has connected.`);
  } else {
    console.log(`Status is ${connStatus}`);
  }
  let birthdayJobRunning = false;
  cron.schedule(
    "5 4 * * *",
    async () => {
      if (birthdayJobRunning)
        return;
      else {
        birthdayJobRunning = true;
        try {
          const start = Date.now();
          console.log(`${ts()} -> [birthday] running daily announcer`);
          const res = await runBirthdayAnnouncer(client);
          const elapsed = Date.now() - start;
          console.log(
            `${ts()} -> [birthday] announcer finished in ${(elapsed / 1e3).toFixed(2)}s`,
            `
Birthdays Found: ${res.birthdaysFound}`
          );
        } catch (err) {
          console.error(`${ts()} -> [birthday] announcer error:`, err);
        } finally {
          birthdayJobRunning = false;
        }
      }
    },
    {
      timezone: "America/New_York"
    }
  );
  setTimeout(async () => {
    try {
      const start = Date.now();
      console.log(`${ts()} -> [birthday] startup catch-up run`);
      const res = await runBirthdayAnnouncer(client);
      const elapsed = Date.now() - start;
      console.log(
        `${ts()} -> [birthday] catch-up announcer finished in ${(elapsed / 1e3).toFixed(2)}s`,
        `
Birthdays Found: ${res.birthdaysFound}`
      );
    } catch (err) {
      console.error(`${ts()} -> [birthday] startup run error:`, err);
    }
  }, 15e3);
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
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isButton())
      return;
    const handledBirthday = await handleBirthdayButtons(interaction);
    if (handledBirthday)
      return;
  } catch (err) {
    console.error("interactionCreate error:", err);
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "Something went wrong." }).catch(() => {
        });
      } else {
        await interaction.reply({
          content: "Something went wrong.",
          flags: MessageFlags.Ephemeral
        }).catch(() => {
        });
      }
    }
  }
});
await client.login(process.env.DISCORD_TOKEN);
