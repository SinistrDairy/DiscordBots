import { Schema } from "mongoose";
import mongo from "mongoose";

const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const defNumber = { type: Number, default: 0 };
const reqArray = { type: String, required: true };

const sEventSchema = new Schema({
  name: uniqString,
  title: reqString,
  daRulez: [reqArray],
  scoring: [reqArray],
  pointList: [reqArray],
  eEmojiID: reqString,
  rEmojiID: reqString,
  tags: reqString,
  serverID: reqString,
});

const name = "specialEvents";

export default mongo.model(name, sEventSchema);
