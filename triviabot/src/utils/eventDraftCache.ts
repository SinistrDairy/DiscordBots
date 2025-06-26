// src/utils/eventDraftCache.ts

export type DraftKey = "event" | "special";
export interface EventDraft {
  key: DraftKey;
  name: string;
  title: string;
  titleEmoji: string | "";
  rulesEmoji: string;
  eventEmoji: string;
  daRulez: string[];
  scoring: string[];
  pointList: string[];
  tags: string;
  serverID: string;

  previewMessageId: string;
  previewChannelId: string;
  eventEmojiPage?: number;
  rulesEmojiPage?: number;
}
export const eventDrafts = new Map<string, Partial<EventDraft>>();
