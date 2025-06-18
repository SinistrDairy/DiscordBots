import mongoose, { Schema } from "mongoose";
const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const charSchema = new Schema({
  name: uniqString,
  image: uniqString,
  badGuy: uniqString,
  isChosen: { type: Boolean, default: false }
});
const name = "dChars";
var char_Schema_default = mongoose.models[name] || mongoose.model(name, charSchema);
export {
  char_Schema_default as default
};
