import { Schema, model } from "mongoose";
const lootStatusSchema = new Schema({
  key: { type: String, required: true, unique: true },
  // e.g., "lootEnabled"
  value: { type: Boolean, required: true }
});
var loot_status_schema_default = model("LootStatus", lootStatusSchema);
export {
  loot_status_schema_default as default
};
