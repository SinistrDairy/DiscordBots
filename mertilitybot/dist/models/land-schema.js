import { Schema } from "mongoose";
import mongo from "mongoose";
const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const reqBool = { type: Boolean, required: true };
const defNumber = { type: Number, default: 0 };
const landSchema = new Schema({
  name: reqString,
  roleID: uniqString,
  emojiID: uniqString,
  totalPoints: defNumber,
  triviaPoints: defNumber,
  special: reqBool,
  serverID: reqString
});
const name = "lands";
var land_schema_default = mongo.models[name] || mongo.model(name, landSchema);
export {
  land_schema_default as default
};
