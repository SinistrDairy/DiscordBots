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

  // 🟡 Optional for "special" only
  howToPlay?: string[];
  hEmojiID?: string;
  color?: string;
  mImage?: string;
  fImage?: string;

  // 🟡 Internal editor/emoji pagination (optional)
  eventEmojiPage?: number;
  rulesEmojiPage?: number;
}

export const eventDrafts = new Map<string, Partial<EventDraft>>();
