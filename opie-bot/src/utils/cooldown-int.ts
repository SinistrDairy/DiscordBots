import { ButtonInteraction } from "discord.js";
import CooldownModel from "../models/core/cooldown-Schema.js";
import { convertTimeToMilliseconds } from "./strToMilli.js";

/**
 * Parse duration input (number or string) into milliseconds.
 * (Copied intentionally from cooldown.ts for consistency.)
 */
function parseDuration(duration: number | string): number {
  if (typeof duration === "number") return duration;
  const ms = convertTimeToMilliseconds(duration);
  if (ms === undefined) {
    throw new Error(`Invalid duration string: '${duration}'`);
  }
  return ms;
}

/**
 * Returns how many ms remain on cooldown, or 0 if ready.
 */
export async function getRemainingCooldownFromInteraction(
  commandName: string,
  interaction: ButtonInteraction,
): Promise<number> {
  const rec = await CooldownModel.findOne({
    userId: interaction.user.id,
    COMMAND_NAME: commandName,
  });

  if (!rec) return 0;

  const diff = rec.expires.getTime() - Date.now();
  return diff > 0 ? diff : 0;
}

/**
 * Sets (or refreshes) a cooldown for this user+command.
 */
export async function setCooldownFromInteraction(
  commandName: string,
  interaction: ButtonInteraction,
  duration: number | string,
): Promise<void> {
  const durationMs = parseDuration(duration);
  const expires = new Date(Date.now() + durationMs);

  await CooldownModel.findOneAndUpdate(
    { userId: interaction.user.id, COMMAND_NAME: commandName },
    { $set: { expires } },
    { upsert: true },
  );
}
