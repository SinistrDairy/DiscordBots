import { Schema } from "mongoose";
import mongo from "mongoose";

export interface SpecialEvent {
  name: string;
  title: string;
  tagLine: string;
  color: string;
  howToPlay: string[];
  daRulez: string[];
  scoring: string[];
  pointList: string[];
  mImage: string;
  fImage?: string;
  eEmojiID: string;
  hEmojiID: string;
  rEmojiID: string;
  tags: string;
  serverID: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reqString = { type: String, required: true };
const uniqString = { type: String, required: true, unique: true };
const reqArray = {
  type: [String],
  required: true,
  validate: {
    validator: (arr: string[]) => arr.length > 0,
    message: "Array cannot be empty",
  },
};
const color = {
  type: String,
  default: "#ffffff",
  match: /^#([0-9A-Fa-f]{6})$/,
};

const sEventSchema = new Schema<SpecialEvent>(
  {
    name: uniqString,
    title: reqString,
    tagLine: {type: String, default: null},
    color: color,
    howToPlay: reqArray,
    daRulez: reqArray,
    scoring: reqArray,
    pointList: reqArray,
    mImage: reqString,
    fImage: { type: String, default: undefined },
    eEmojiID: reqString,
    hEmojiID: reqString,
    rEmojiID: reqString,
    tags: reqString,
    serverID: { ...reqString, index: true },
  },
  { timestamps: true }
);

const name = "specialEvents";

export default mongo.model<SpecialEvent>(name, sEventSchema);
