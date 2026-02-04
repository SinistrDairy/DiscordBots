// src/models/birthday/birthday-claim-schema.ts
import mongoose from "mongoose";
import {
  requiredString,
  optionalString,
  boolDefault,
  dateField,
} from "../_schemaFields.js";

const BirthdayClaimSchema = new mongoose.Schema(
  {
    guildId: requiredString(true),
    userId: requiredString(true),
    dayKey: requiredString(true), // YYYY-MM-DD (ET)
    expiresAt: { type: Date, default: undefined, index: true },

    posted: boolDefault(false),
    claimed: boolDefault(false),

    channelId: optionalString(),
    messageId: optionalString(),
    claimedAt: dateField(),
  },
  { timestamps: true },
);

BirthdayClaimSchema.index(
  { guildId: 1, userId: 1, dayKey: 1, expiresAt: 1 },
  { unique: true, expireAfterSeconds: 0 },
);

export default mongoose.model("BirthdayClaim", BirthdayClaimSchema);
