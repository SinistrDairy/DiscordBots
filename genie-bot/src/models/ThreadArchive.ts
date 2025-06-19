// src/models/ThreadArchive.ts
import { Schema, model, Document } from "mongoose";

export interface ThreadArchiveDoc extends Document {
  threadId: string;
  archiveAt: Date;
  archived: boolean;
  endNotified: boolean;
}

const threadArchiveSchema = new Schema<ThreadArchiveDoc>(
  {
    threadId: { type: String, required: true, index: true },
    archiveAt: { type: Date, required: true },
    archived: { type: Boolean, default: false },
    endNotified: { type: Boolean, default: false },
  },
  {
    collection: "ThreadArchive", // or whatever your Mongo collection is named
    timestamps: true,
  }
);

export const ThreadArchive = model<ThreadArchiveDoc>(
  "ThreadArchive",
  threadArchiveSchema
);
