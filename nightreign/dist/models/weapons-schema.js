import { Schema, model } from "mongoose";
const weaponSchema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  rarity: {
    type: String,
    enum: ["Common", "Uncommon", "Rare", "Legendary"],
    required: true
  },
  attack: {
    physical: Number,
    magic: Number,
    fire: Number,
    lightning: Number,
    holy: Number,
    crit: Number
  },
  guard: {
    physical: Number,
    magic: Number,
    fire: Number,
    lightning: Number,
    holy: Number,
    boost: Number
  },
  scaling: {
    strength: String,
    dexterity: String,
    intelligence: String,
    faith: String,
    arcane: String
  },
  requirements: {
    level: Number
  },
  affinity: { type: String },
  status: {
    type: { type: String },
    amount: { type: Number }
  },
  weaponSkill: { type: String },
  uniqueEffect: { type: String }
});
var weapons_schema_default = model("Weapon", weaponSchema);
export {
  weapons_schema_default as default
};
