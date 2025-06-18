import mongo from "mongoose";
import Weapon from "../models/weapons-schema.js";
import { weapons } from "./toBeSeedWeapons.js";
import "dotenv/config";
async function seedWeapons() {
  try {
    await mongo.connect(process.env.MONGOURI);
    const connStatus = mongo.connection.readyState;
    if (connStatus == 1) {
      console.log(`Connected.`);
    } else {
      console.log(`Status is ${connStatus}`);
    }
    const count = await Weapon.estimatedDocumentCount();
    if (count > 0) {
      console.log(`\u26A0\uFE0F Skipping seed: ${count} weapons already exist.`);
      return;
    }
    await Weapon.insertMany(weapons);
    console.log(`\u2705 Seeded ${weapons.length} weapons into MongoDB.`);
  } catch (err) {
    console.error("\u274C Failed to seed weapons:", err);
  } finally {
    await mongo.disconnect();
  }
}
seedWeapons();
