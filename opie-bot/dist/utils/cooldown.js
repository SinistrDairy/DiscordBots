import { EmbedBuilder, MessageFlags } from "discord.js";
import CooldownModel from "../models/core/cooldown-Schema.js";
import { convertTimeToMilliseconds } from "./strToMilli.js";
function parseDuration(duration) {
  if (typeof duration === "number")
    return duration;
  const ms = convertTimeToMilliseconds(duration);
  if (ms === void 0) {
    throw new Error(`Invalid duration string: '${duration}'`);
  }
  return ms;
}
async function getRemainingCooldown(commandName, ctx) {
  const rec = await CooldownModel.findOne({
    userId: ctx.user.id,
    COMMAND_NAME: commandName
  });
  if (!rec)
    return 0;
  const diff = rec.expires.getTime() - Date.now();
  return diff > 0 ? diff : 0;
}
function formatDuration(ms) {
  const totalSec = Math.ceil(ms / 1e3);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor(totalSec % 3600 / 60);
  const secs = totalSec % 60;
  const parts = [];
  if (hrs)
    parts.push(`${hrs}h`);
  if (mins)
    parts.push(`${mins}m`);
  if (secs || parts.length === 0)
    parts.push(`${secs}s`);
  return parts.join(" ");
}
async function setCooldown(commandName, ctx, duration) {
  const durationMs = parseDuration(duration);
  const expires = new Date(Date.now() + durationMs);
  await CooldownModel.findOneAndUpdate(
    { userId: ctx.user.id, COMMAND_NAME: commandName },
    { $set: { expires } },
    { upsert: true }
  );
}
async function handleCooldown(commandName, ctx, duration, opts) {
  const remaining = await getRemainingCooldown(commandName, ctx);
  if (remaining > 0) {
    if (opts?.useTimestampEmbed) {
      const endTime = Math.floor((Date.now() + remaining) / 1e3);
      return ctx.reply({
        embeds: [
          new EmbedBuilder().setColor(opts.color ?? "#ffd483").setTitle(opts.title ?? "On Cooldown").setDescription(
            [
              `${opts.description1 ?? "Use this command again"}`,
              "",
              `${opts.description2 ?? `<t:${endTime}:R>`}`
            ].join("\n")
          )
        ],
        flags: MessageFlags.Ephemeral
      }).then(() => false);
    }
    const waitSec = Math.ceil(remaining / 1e3);
    ctx.reply({ content: `\u23F3 Wait ${waitSec}s\u2026`, flags: MessageFlags.Ephemeral }).then(
      () => setTimeout(
        () => ctx.interaction.deleteReply().catch(() => null),
        remaining
      )
    );
    return false;
  }
  await setCooldown(commandName, ctx, duration);
  return true;
}
export {
  getRemainingCooldown,
  handleCooldown,
  setCooldown
};
