import { EmbedBuilder } from "discord.js";

export type EmbedFlow = "admin" | "mod" | "cow";

export interface EmbedDraft {
  flow: EmbedFlow;
  channelId: string;
  mention?: string;
  embed: EmbedBuilder;
  timestamp: boolean;
  archiveDelayMs?: number;

}

export const draftCache = new Map<string, EmbedDraft>();
