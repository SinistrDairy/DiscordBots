import { Schema } from "mongoose";
import mongo from "mongoose";

const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };

const messageSchema = new Schema({
  title: reqString,
  body: uniqString,
  emojiID: reqString,
  tags: reqString,
  serverID: reqString,
});

const name = "messages";

export default mongo.model(name, messageSchema);
