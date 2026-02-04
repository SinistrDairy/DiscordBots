import { TextChannel, Client } from "discord.js";

const ECONOMY_LOG_CHANNEL_ID = process.env.ECONOMY_LOG_CHANNEL_ID!;

function displayName(user: { globalName: string | null; username: string }) {
  return user.globalName ?? user.username;
}

/**
 * Logs a jewel award to the economy log channel.
 */
export async function logJewelAward(opts: {
  client: Client;
  user: { id: string; globalName: string | null; username: string };
  jewels: number;
  source: string; // e.g. "/garden", "birthday", "/mine"
  landName?: string;
}) {
  try {
    const log = opts.client.channels.cache.get(ECONOMY_LOG_CHANNEL_ID) as
      | TextChannel
      | undefined;

    if (!log) return;

    const name = displayName(opts.user);
    const landPart = opts.landName ? ` → ${opts.landName}` : "";

    await log.send(
      `<:v_opie:1376727584435474542> ${name} earned ${opts.jewels} jewels from ${opts.source}${landPart}`
    );
  } catch {
    // swallow on purpose
  }
}