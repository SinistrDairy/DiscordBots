import { Schema } from "mongoose";
import mongo from "mongoose";
const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const defNumber = { type: Number, default: 0 };
const reqArray = { type: String, required: true };
const eventSchema = new Schema({
  name: uniqString,
  pointList: [reqArray],
  title: reqString,
  daRulez: [reqArray],
  scoring: [reqArray],
  emojiID: reqString,
  tags: reqString,
  serverID: reqString
});
const name = "events";
var event_schema_default = mongo.model(name, eventSchema);
export {
  event_schema_default as default
};
