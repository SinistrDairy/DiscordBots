import { Schema, SchemaType } from "mongoose";
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
  serverID: reqString,
});

const name = "users";

export default mongo.model(name, userSchema);
