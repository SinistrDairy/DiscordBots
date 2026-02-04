import type { Client, ButtonInteraction } from "discord.js";
import type { Context } from "@sern/handler";

import { addPointsToUserLand } from "./addPointsToLand.js";
import { logJewelAward } from "./economy-log.js";

export type AwardJewelsResult =
  | { ok: true; landName: string }
  | { ok: false; reason: "User profile not found." | "Land not found." | "Invalid points." };

/**
 * Core award function:
 * - Adds points to LAND (mongo totalPoints)
 * - Logs to economy log channel
 *
 * "jewels" is the user-facing name; stored as points in DB.
 */
export async function logJewels(opts: {
  client: Client;
  userID: string;
  serverID: string;
  jewels: number;
  source: string; // "/mine", "/garden", "birthday", etc.
  userDisplay: { id: string; globalName: string | null; username: string };
}): Promise<AwardJewelsResult> {
  const res = await addPointsToUserLand(opts.userID, opts.serverID, opts.jewels);

  if (!res.ok) return res;

  // Best-effort log. Never block awards if logging fails.
  await logJewelAward({
    client: opts.client,
    user: opts.userDisplay,
    jewels: opts.jewels,
    source: opts.source,
    landName: res.landName,
  });

  return res;
}

/**
 * Convenience wrapper for Sern command ctx.
 * Keeps call sites to: awardJewelsFromCtx(ctx, { jewels, source })
 */
export function logJewelsFromCtx(
  ctx: Context,
  opts: { jewels: number; source: string }
): Promise<AwardJewelsResult> {
  return logJewels({
    client: ctx.client,
    userID: ctx.user.id,
    serverID: ctx.guildId!,
    jewels: opts.jewels,
    source: opts.source,
    userDisplay: ctx.user,
  });
}

/**
 * Convenience wrapper for ButtonInteraction.
 * Keeps call sites to: awardJewelsFromInteraction(interaction, { jewels, source })
 */
export function logJewelsFromInteraction(
  interaction: ButtonInteraction,
  opts: { jewels: number; source: string }
): Promise<AwardJewelsResult> {
  return logJewels({
    client: interaction.client,
    userID: interaction.user.id,
    serverID: interaction.guildId!,
    jewels: opts.jewels,
    source: opts.source,
    userDisplay: interaction.user,
  });
}
