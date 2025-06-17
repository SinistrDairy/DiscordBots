import { Schema, model, models } from "mongoose";
import mongo from "mongoose";

const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const defNumber = { type: Number, default: 0 };

const triviaSchema = new Schema({
  title: reqString,
  host: reqString,
  serverID: reqString,
});

const name = "trivia";

export default mongo.models[name] || mongo.model(name, triviaSchema);
