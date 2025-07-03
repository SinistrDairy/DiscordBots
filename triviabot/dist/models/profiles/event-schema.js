import { Schema } from "mongoose";
import mongo from "mongoose";
const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const reqArray = { type: [String], required: true };
const eventSchema = new Schema({
  name: uniqString,
  title: reqString,
  daRulez: reqArray,
  scoring: reqArray,
  pointList: reqArray,
  eEmojiID: reqString,
  rEmojiID: reqString,
  tags: reqString,
  serverID: reqString
});
const name = "events";
var event_schema_default = mongo.model(name, eventSchema);
export {
  event_schema_default as default
};
