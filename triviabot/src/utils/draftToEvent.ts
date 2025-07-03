// src/utils/draftToEvent.ts
import { EventDraft } from "./eventDraftCache";
import EventModel from "../models/profiles/event-schema.js";
import SpecialEventModel from "../models/profiles/special-event-schema.js";

// ---- Interface for Regular Event ----
export interface RegularEventModelInput {
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

// ---- Interface for Special Event ----
export interface SpecialEventModelInput extends RegularEventModelInput {
  howToPlay: string[];
  hEmojiID: string;
  color: string;
  mImage: string;
  fImage?: string;
}

// ---- Error Class ----
export class DuplicateEventError extends Error {
  public existing: any;
  constructor(existing: any) {
    super("Duplicate event exists");
    this.existing = existing;
    Object.setPrototypeOf(this, DuplicateEventError.prototype);
  }
}

// ---- Convert to Regular Event Input ----
function toRegularEventInput(
  draft: Partial<EventDraft>
): RegularEventModelInput {
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
    throw new Error("Missing required regular event fields.");
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

// ---- Convert to Special Event Input ----
function toSpecialEventInput(
  draft: Partial<EventDraft>
): SpecialEventModelInput {
  const {
    name,
    title,
    pointList,
    daRulez,
    scoring,
    eventEmoji,
    rulesEmoji,
    hEmojiID,
    howToPlay,
    tags,
    serverID,
    color,
    mImage,
    fImage,
  } = draft;

  if (
    !name ||
    !title ||
    !Array.isArray(pointList) ||
    !Array.isArray(daRulez) ||
    !Array.isArray(scoring) ||
    !Array.isArray(howToPlay) ||
    !eventEmoji ||
    !rulesEmoji ||
    !hEmojiID ||
    !color ||
    !mImage ||
    !tags ||
    !serverID
  ) {
    throw new Error("Missing required special event fields.");
  }

  return {
    name,
    title,
    pointList,
    daRulez,
    scoring,
    howToPlay,
    eEmojiID: eventEmoji,
    rEmojiID: rulesEmoji,
    hEmojiID,
    color,
    mImage,
    fImage,
    tags,
    serverID,
  };
}

// ---- Save to DB ----
export async function saveDraftToDB(
  draft: Partial<EventDraft>,
  overwrite = false
) {
  if (draft.key === "special") {
    const input = toSpecialEventInput(draft);

    const existing = await SpecialEventModel.findOne({
      name: input.name,
      serverID: input.serverID,
    });

    if (existing && !overwrite) {
      throw new DuplicateEventError(existing);
    }

    return SpecialEventModel.findOneAndUpdate(
      { name: input.name, serverID: input.serverID },
      input,
      { new: true, upsert: true }
    );
  } else {
    const input = toRegularEventInput(draft);

    const existing = await EventModel.findOne({
      name: input.name,
      serverID: input.serverID,
    });

    if (existing && !overwrite) {
      throw new DuplicateEventError(existing);
    }

    return EventModel.findOneAndUpdate(
      { name: input.name, serverID: input.serverID },
      input,
      { new: true, upsert: true }
    );
  }
}
