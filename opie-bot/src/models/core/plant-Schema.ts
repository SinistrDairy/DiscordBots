import { Schema, model } from "mongoose";
import mongo from "mongoose";

const plantSchema = new Schema({
  plantName: {
    type: String,
    required: true,
  },
  plantImage: {
    type: String,
    required: true,
  },
});

const name = "plants";

export default mongo.models[name] || mongo.model(name, plantSchema);
