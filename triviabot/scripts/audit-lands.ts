// scripts/audit-lands.ts
import "dotenv/config";
import mongoose from "mongoose";

(async () => {
  const schemaMod = await import("../dist/models/profiles/user-schema.js");
  const userSchema = schemaMod.default ?? schemaMod;

  await mongoose.connect(process.env.MONGOURI!);
  if (mongoose.connection.readyState !== 1) {
    console.error(
      "❌ Mongo failed to connect:",
      mongoose.connection.readyState
    );
    process.exit(1);
  }

  // 1) Aggregate distinct land values + counts
  console.log("=== Land distribution ===");
  const breakdown = await userSchema.aggregate([
    { $group: { _id: "$land", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  breakdown.forEach(({ _id: land, count }) => {
    const isLower = land === String(land).toLowerCase();
    console.log(
      `${isLower ? "✔" : "⚠️"} "${land}" — ${count} user${
        count !== 1 ? "s" : ""
      }`
    );
  });

  // 2) Find all users whose `land` has any uppercase letter
  const badUsers = await userSchema.find({
    land: { $exists: true, $ne: "", $regex: /[A-Z]/ },
  });

  console.log(`\nUsers with non-lowercase land (${badUsers.length}):`);
  badUsers.forEach((u) =>
    console.log(` • ${u.userName} (${u.userID}): "${u.land}"`)
  );

  process.exit(0);
})();
