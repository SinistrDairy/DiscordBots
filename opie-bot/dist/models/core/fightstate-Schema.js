import mongoose, { Schema } from "mongoose";
const fightSchema = new Schema({
  serverID: { type: String, required: true, unique: true },
  active: { type: Boolean, default: false }
});
var fightstate_Schema_default = mongoose.models.FightState || mongoose.model("FightState", fightSchema);
export {
  fightstate_Schema_default as default
};
