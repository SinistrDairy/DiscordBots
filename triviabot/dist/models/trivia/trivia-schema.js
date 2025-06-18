import { Schema } from "mongoose";
import mongo from "mongoose";
const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const defNumber = { type: Number, default: 0 };
const triviaSchema = new Schema({
  title: reqString,
  host: reqString,
  serverID: reqString
});
const name = "trivia";
var trivia_schema_default = mongo.models[name] || mongo.model(name, triviaSchema);
export {
  trivia_schema_default as default
};
