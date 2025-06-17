import mongoose, { Schema } from "mongoose";

const fightSchema = new Schema({
  serverID: { type: String, required: true, unique: true },
  active: { type: Boolean, default: false },
});

export default mongoose.models.FightState ||
  mongoose.model("FightState", fightSchema);
