import { Schema } from "mongoose";
import mongo from "mongoose";
const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const defNumber = { type: Number, default: 0 };
const userSchema = new Schema({
  userName: uniqString,
  userID: uniqString,
  nickName: uniqString,
  land: reqString,
  totalPoints: defNumber,
  events: [],
  serverID: reqString
});
const name = "users";
var user_schema_default = mongo.model(name, userSchema);
export {
  user_schema_default as default
};
