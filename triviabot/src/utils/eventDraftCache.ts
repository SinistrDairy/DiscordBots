// src/utils/eventDraftCache.ts
export interface EventDraft {
  name: string;
  title: string;
  titleEmoji: string;
  rulesEmoji: string;
  jewelEmoji: string;
  eventEmoji: string;
  daRulez: string[];
  scoring: string[];
  pointList: string[];
  tags: string;
  serverID: string;

  previewMessageId: string,
}
export const eventDrafts = new Map<string, Partial<EventDraft>>();
