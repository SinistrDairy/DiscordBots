import eventSchema from "../models/profiles/event-schema.js";

interface CacheEntry {
  names: string[];
  fetchedAt: number;
}

const CACHE_TTL = 30_000; // 30 seconds
const cache: Map<string, CacheEntry> = new Map();

/**
 * Returns an up-to-date array of event names for this guild,
 * using an in-memory cache to rate-limit DB calls.
 */
async function getCachedNames(serverID: string): Promise<string[]> {
  const now = Date.now();
  const entry = cache.get(serverID);

  if (entry && now - entry.fetchedAt < CACHE_TTL) {
    return entry.names;
  }

  const docs = await eventSchema.find({ serverID }).select("name").lean();

  const names = docs
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  cache.set(serverID, { names, fetchedAt: now });
  return names;
}

/**
 * Autocomplete handler: suggests up to 25 event names.
 */
export async function suggestEvents(ctx: any) {
  const serverID = ctx.guildId!;
  const focus = ctx.options.getFocused(false).toLowerCase();

  // 1) Grab cached (or freshly‐fetched) names
  const allNames = await getCachedNames(serverID);

  console.log("[suggestEvents] focused =", ctx.options.getFocused(false));

  let choices: { name: string; value: string }[];

  if (!focus) {
    // No input yet: show the first 25
    choices = allNames.slice(0, 25).map((n) => ({ name: n, value: n }));
  } else {
    // 2) Split into prefix‐ and substring‐matches
    const prefixMatches = allNames.filter((n) =>
      n.toLowerCase().startsWith(focus)
    );
    const substrMatches = allNames.filter(
      (n) =>
        !n.toLowerCase().startsWith(focus) && n.toLowerCase().includes(focus)
    );

    // 3) Take up to 25 total, prefix first
    const combined = [...prefixMatches, ...substrMatches].slice(0, 25);
    choices = combined.map((n) => ({ name: n, value: n }));
  }

  await ctx.respond(choices);
}
