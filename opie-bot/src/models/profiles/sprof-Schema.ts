// src/models/profiles/sProf-Schema.ts
import mongoose, { Schema } from "mongoose";

const reqString = { type: String, required: true };
const defNumber = { type: Number, default: 0 };

const spraySchema = new Schema(
  {
    userID: reqString,
    nickname: reqString,
    currSprays: defNumber,
    wBank: defNumber,
    currHits: defNumber,
    allTimeHits: defNumber,
    allTimeRec: defNumber,
    serverID: reqString,
    lastSprayTime: { type: Number, default: 0 },
    lastTarget: { type: String, default: "" },

    // ─── NEW: timestamp (ms) at which the refill completes ───
    refillReadyAt: { type: Number, default: 0 },
    needsRefill: {type: Boolean, default: false}
  },
  { timestamps: true }
);

spraySchema.index({ userID: 1, serverID: 1 }, { unique: true });

const name = "sGProfiles";
export default mongoose.models[name] || mongoose.model(name, spraySchema);