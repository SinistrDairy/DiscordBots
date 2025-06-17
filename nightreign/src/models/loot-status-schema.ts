// src/models/loot-status-schema.ts
import { Schema, model } from "mongoose";

const lootStatusSchema = new Schema({
  key: { type: String, required: true, unique: true }, // e.g., "lootEnabled"
  value: { type: Boolean, required: true },
});

export default model("LootStatus", lootStatusSchema);
