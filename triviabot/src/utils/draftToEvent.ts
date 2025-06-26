// src/utils/draftToEvent.ts
import { EventDraft } from "./eventDraftCache";
import EventModel from "../models/profiles/event-schema.js";
import SpecialEventModel from "../models/profiles/special-event-schema.js";
import { title } from "process";

export interface EventModelInput {
  name: string;
  title: string;
  pointList: string[];
  daRulez: string[];
  scoring: string[];
  eEmojiID: string;
  rEmojiID: string;
  tags: string;
  serverID: string;
}

/**
 * Custom error thrown when trying to save an event
 * that already exists in the database.
 */
export class DuplicateEventError extends Error {
  public existing: any;
  constructor(existing: any) {
    super("Duplicate event exists");
    this.existing = existing;
    Object.setPrototypeOf(this, DuplicateEventError.prototype);
  }
}

/**
 * Convert a fully-populated draft into the shape
 * your Mongoose model expects, combining emojis
 * as specified, and removing titleEmoji/jewelEmoji fields.
 */
export function toEventInput(
  draft: Partial<EventDraft>
): EventModelInput {
  const {
    name,
    title,
    pointList,
    daRulez,
    scoring,
    eventEmoji,
    rulesEmoji,
    tags,
    serverID,
  } = draft;

  // Validate required fields
  if (
    !name ||
    !title ||
    !Array.isArray(pointList) ||
    !Array.isArray(daRulez) ||
    !Array.isArray(scoring) ||
    !eventEmoji ||
    !rulesEmoji ||
    !tags ||
    !serverID
  ) {
    throw new Error(
      "Cannot save: draft is missing one or more required fields"
    );
  }

  return {
    name,
    title,
    pointList,
    daRulez,
    scoring,
    eEmojiID: eventEmoji,
    rEmojiID: rulesEmoji,
    tags,
    serverID,
  };
}

/**
 * Persist a draft to MongoDB, with optional overwrite.
 * Throws DuplicateEventError if an event with the same name
 * and serverID exists and overwrite is false.
 * If overwrite is true, updates the existing document.
 */
export async function saveDraftToDB(
  draft: Partial<EventDraft>,
  overwrite: boolean = false
) {
  const input = toEventInput(draft);
  const Model = draft.key === "special" ? SpecialEventModel : EventModel;

  // Check for existing document
  const existing = await Model.findOne({
    name: input.name,
    serverID: input.serverID,
  });

  if (existing) {
    if (!overwrite) {
      // Let caller decide to overwrite
      throw new DuplicateEventError(existing);
    }
    // Overwrite existing document
    return Model.findOneAndUpdate(
      { name: input.name, serverID: input.serverID },
      input,
      { new: true, upsert: true }
    );
  }

  // Create new document
  return Model.create(input);
}
