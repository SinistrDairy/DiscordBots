import { Schema, SchemaType } from "mongoose";
import mongo from "mongoose";

const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const isArray = { type: Array, default: [{ type: String }] }
const defNumber = { type: Number, default: 0 };

const bProfSchema = new Schema({
  userName: uniqString,
  userID: uniqString,
  bLetters: { type: String },
  bShapes: isArray,
  shapes: isArray,
  letters: isArray,
  isComplete: {type: Boolean, default: false},
  serverID: reqString,
});

const name = "bProfile";

export default mongo.model(name, bProfSchema);
