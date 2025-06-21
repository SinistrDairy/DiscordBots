import "dotenv/config";
import mongoose from "mongoose";
import { existsSync } from "fs";
import { pathToFileURL } from "url";

(async () => {
  // 1) Dynamically import the userSchema from dist or src
  const schemaPath = existsSync("./dist/models/profiles/user-schema.js")
    ? "./dist/models/profiles/user-schema.js"
    : "./src/models/profiles/user-schema.js";
  const schemaMod = await import(pathToFileURL(schemaPath).href);
  const userSchema = schemaMod.default ?? schemaMod;

  // 2) Connect to MongoDB
  await mongoose.connect(process.env.MONGOURI!);
  if (mongoose.connection.readyState !== 1) {
    console.error(
      "❌ MongoDB failed to connect:",
      mongoose.connection.readyState
    );
    process.exit(1);
  }

  // 3) Fix missing or empty land fields
  const missingFilter = {
    $or: [{ land: { $exists: false } }, { land: "" }],
  };
  const missingRes = await userSchema.updateMany(missingFilter, {
    $set: { land: "unassigned" },
  });
  console.log(
    `🛠️  Updated missing/empty lands: ${missingRes.modifiedCount} document(s)`
  );

  // 4) Find all users with any uppercase letters in land
  const uppercaseUsers = await userSchema
    .find({ land: { $regex: /[A-Z]/ } })
    .lean();

  console.log(
    `⚙️  Converting ${uppercaseUsers.length} land value(s) to lowercase:`
  );
  for (const u of uppercaseUsers) {
    const newLand = u.land.toLowerCase();
    await userSchema.updateOne({ _id: u._id }, { $set: { land: newLand } });
    console.log(`   • ${u.userName} (${u.userID}): "${u.land}" → "${newLand}"`);
  }

  console.log("✅ All land issues fixed.");
  process.exit(0);
})();
