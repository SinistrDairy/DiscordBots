import { Schema } from "mongoose";
import mongo from "mongoose";
const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const messageSchema = new Schema({
  title: reqString,
  body: uniqString,
  emojiID: reqString,
  tags: reqString,
  serverID: reqString
});
const name = "messages";
var message_schema_default = mongo.model(name, messageSchema);
export {
  message_schema_default as default
};
