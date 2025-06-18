import { Schema } from "mongoose";
import mongo from "mongoose";
const plantSchema = new Schema({
  plantName: {
    type: String,
    required: true
  },
  plantImage: {
    type: String,
    required: true
  }
});
const name = "plants";
var plant_Schema_default = mongo.models[name] || mongo.model(name, plantSchema);
export {
  plant_Schema_default as default
};
