import { Schema, model } from "mongoose";
const characterSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  class: { type: String, required: true },
  stats: {
    evasion: Number,
    armor: Number,
    agility: Number,
    strength: Number,
    finesse: Number,
    instinct: Number,
    presence: Number,
    knowledge: Number
  },
  hp: Number,
  stress: Number,
  hope: Number,
  damage: {
    minor: Number,
    major: Number,
    severe: Number
  },
  maxHp: Number,
  maxHope: Number,
  maxStress: Number,
  activeWeapon: { type: String, default: "none" },
  inventoryWeapon: { type: String, default: "none" }
});
var character_schema_default = model("Character", characterSchema);
export {
  character_schema_default as default
};
