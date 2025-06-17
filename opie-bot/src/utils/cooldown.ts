// src/utils/cooldown.ts
import { Context } from "@sern/handler";
import { EmbedBuilder, MessageFlags, ColorResolvable } from "discord.js";
import CooldownModel from "../models/core/cooldown-Schema.js";
import { convertTimeToMilliseconds } from "./strToMilli.js";

interface CooldownOptions {
  useTimestampEmbed?: boolean;
  title?: string;
  color?: ColorResolvable;  
  description1?: string;
  description2?: string;
}

/**
 * Parse duration input (number or string) into milliseconds.
 * @param duration Duration in ms or human string (e.g. "6h").
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
export async function getRemainingCooldown(
  commandName: string,
  ctx: Context
): Promise<number> {
  const rec = await CooldownModel.findOne({
    userId: ctx.user.id,
    COMMAND_NAME: commandName,
  });
  if (!rec) return 0;
  const diff = rec.expires.getTime() - Date.now();
  return diff > 0 ? diff : 0;
}

function formatDuration(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const parts: string[] = [];
  if (hrs) parts.push(`${hrs}h`);
  if (mins) parts.push(`${mins}m`);
  if (secs || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Sets (or refreshes) a cooldown for this user+command.
 * @param duration Duration in ms or human string (e.g. "6h").
 */
export async function setCooldown(
  commandName: string,
  ctx: Context,
  duration: number | string
): Promise<void> {
  const durationMs = parseDuration(duration);
  const expires = new Date(Date.now() + durationMs);
  await CooldownModel.findOneAndUpdate(
    { userId: ctx.user.id, COMMAND_NAME: commandName },
    { $set: { expires } },
    { upsert: true }
  );
}

/**
 * Checks & handles cooldown. If still cooling down:
 *  • sends an ephemeral “Wait Xs” reply and auto-deletes it
 *  • returns false
 * If ready:
 *  • sets the new cooldown and returns true
 * @param duration Duration in ms or human string (e.g. "6h").
 */
export async function handleCooldown(
  commandName: string,
  ctx: Context,
  duration: number | string,
  opts?: CooldownOptions
): Promise<boolean> {
  const remaining = await getRemainingCooldown(commandName, ctx);
  if (remaining > 0) {
    if (opts?.useTimestampEmbed) {
      const endTime = Math.floor((Date.now() + remaining) / 1000);
      return ctx
        .reply({
          embeds: [
            new EmbedBuilder()
              .setColor((opts.color ?? "#ffd483") as ColorResolvable)
              .setTitle(opts.title ?? "On Cooldown")
              .setDescription(
                [
                  `${opts.description1 ?? "Use this command again" }`,
                  "",
                  `${opts.description2 ?? `<t:${endTime}:R>`}`
                ].join("\n")
              ),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then(() => false);
    }
    // fallback to simple seconds
    const waitSec = Math.ceil(remaining / 1000);
    ctx
      .reply({ content: `⏳ Wait ${waitSec}s…`, flags: MessageFlags.Ephemeral })
      .then(() =>
        setTimeout(
          () => ctx.interaction.deleteReply().catch(() => null),
          remaining
        )
      );
    return false;
  }
  await setCooldown(commandName, ctx, duration);
  return true;
}
