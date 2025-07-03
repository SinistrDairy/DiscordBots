import { Schema } from "mongoose";
import mongo from "mongoose";

export interface Event {
  name: string;
  title: string;
  daRulez: string[];
  scoring: string[];
  pointList: string[];
  eEmojiID: string;
  rEmojiID: string;
  tags: string;
  serverID: string;
}

const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const reqArray = { type: [String], required: true };

const eventSchema = new Schema<Event>({
  name: uniqString,
  title: reqString,
  daRulez: reqArray,
  scoring: reqArray,
  pointList: reqArray,
  eEmojiID: reqString,
  rEmojiID: reqString,
  tags: reqString,
  serverID: reqString,
});

const name = "events";

export default mongo.model<Event>(name, eventSchema);
