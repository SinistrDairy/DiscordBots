import { Schema } from "mongoose";
import mongo from "mongoose";
const cdSchema = new Schema(
  {
    userId: { type: String, required: true },
    COMMAND_NAME: { type: String, required: true },
    expires: {
      type: Date,
      required: true,
      index: { expires: 0 }
      // TTL index: remove doc as soon as expires passes
    }
  },
  { timestamps: false }
);
cdSchema.index({ userId: 1, COMMAND_NAME: 1 }, { unique: true });
const name = "cooldowns";
var cooldown_Schema_default = mongo.models[name] || mongo.model(name, cdSchema);
export {
  cooldown_Schema_default as default
};
