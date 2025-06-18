import { Schema, model } from "mongoose";
import mongo from "mongoose";
const reqString = { type: String, required: true };
const isFBool = { type: Boolean, default: false };
const isDate = { type: Date, default: null };
const wArray = [
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    event: { type: String, required: true },
    time: { type: String, required: true },
    emojiID: { type: String, required: true }
  }
];
const schedSchema = new Schema({
  title: reqString,
  wEvent: reqString,
  mInfo: { type: wArray, default: [] },
  tInfo: { type: wArray, default: [] },
  wInfo: { type: wArray, default: [] },
  thInfo: { type: wArray, default: [] },
  fInfo: { type: wArray, default: [] },
  satInfo: { type: wArray, default: [] },
  sunInfo: { type: wArray, default: [] },
  isCurrent: isFBool,
  closedOn: isDate
});
const name = "schedules";
var schedule_schema_default = mongo.models[name] || model(name, schedSchema);
export {
  schedule_schema_default as default
};
