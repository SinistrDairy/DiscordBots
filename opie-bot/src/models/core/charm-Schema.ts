import { Schema, model } from "mongoose";
import mongo from "mongoose";

const charmSchema = new Schema({
  cName: {
    type: String,
    required: true,
  },
  cImage: {
    type: String,
    required: true,
  },
  cType:{
    type: String,
    required: true
  }
});

const name = "charms";

export default mongo.models[name] || mongo.model(name, charmSchema);
