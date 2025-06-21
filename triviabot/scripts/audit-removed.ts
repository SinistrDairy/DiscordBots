// scripts/audit-removed.ts
import "dotenv/config";
import mongoose from "mongoose";
import userSchema from "../src/models/profiles/user-schema.js";
import { Client, GatewayIntentBits } from "discord.js";

(async () => {
  // 1) Connect to MongoDB
  await mongoose.connect(process.env.MONGOURI!);
  if (mongoose.connection.readyState !== 1) {
    console.error(
      "❌ MongoDB failed to connect:",
      mongoose.connection.readyState
    );
    process.exit(1);
  }

  // 2) Create a minimal Discord client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });

  client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);

    // 3) Determine which guild to audit
    const guildId = process.env.GUILD_ID ?? process.env.GUILD_ID1;
    if (!guildId) {
      console.error("❌ You must set GUILD_ID (or GUILD_ID1) in your .env");
      process.exit(1);
    }

    // 4) Fetch all guild members
    const guild = await client.guilds.fetch(guildId);
    const members = await guild.members.fetch();
    const guildMemberIDs = new Set(members.map((m) => m.user.id));

    // 5) Pull all userIDs from your DB
    const docs = await userSchema.find({}, "userID").lean();
    const dbUserIDs = docs.map((d) => d.userID);

    // 6) Figure out which profiles to remove
    const removedIDs = dbUserIDs.filter((id) => !guildMemberIDs.has(id));

    console.log(
      `🔍 Found ${removedIDs.length} profiles for users no longer in guild.`
    );
    if (removedIDs.length) {
      console.log(" • Removing profiles for:");
      removedIDs.forEach((id) => console.log(`   – ${id}`));

      const res = await userSchema.deleteMany({ userID: { $in: removedIDs } });
      console.log(`🗑️  Deleted ${res.deletedCount} documents.`);
    }

    process.exit(0);
  });

  // 7) Launch the client
  client.login(process.env.DISCORD_TOKEN);
})();
