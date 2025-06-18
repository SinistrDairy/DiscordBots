import { Schema } from "mongoose";
import mongo from "mongoose";
const charmSchema = new Schema({
  cName: {
    type: String,
    required: true
  },
  cImage: {
    type: String,
    required: true
  },
  cType: {
    type: String,
    required: true
  }
});
const name = "charms";
var charm_Schema_default = mongo.models[name] || mongo.model(name, charmSchema);
export {
  charm_Schema_default as default
};
