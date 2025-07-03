import specialEventSchema from "../models/profiles/special-event-schema.js";

interface CacheEntry {
  entries: { name: string; title: string }[];
  fetchedAt: number;
}

const CACHE_TTL = 10_000;
const cache: Map<string, CacheEntry> = new Map();

async function searchSpecialEvents(
  serverID: string,
  focus: string
): Promise<{ name: string; title: string }[]> {
  const now = Date.now();
  const cacheKey = `${serverID}:${focus}`;
  const cached = cache.get(cacheKey);

  if (cached && now - cached.fetchedAt < CACHE_TTL) {
    return cached.entries;
  }

  const docs = await specialEventSchema.aggregate([
    {
      $search: {
        index: "specialEventsAutocomplete",
        autocomplete: {
          query: focus,
          path: "name",
          fuzzy: { maxEdits: 1 },
        },
      },
    },
    { $match: { serverID } },
    {
      $project: {
        _id: 0,
        name: 1,
        title: 1,
      },
    },
    { $limit: 25 },
  ]);

  const sorted = docs.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  cache.set(cacheKey, { entries: sorted, fetchedAt: now });
  return sorted;
}

export async function suggestSpecialEvents(ctx: any) {
  const serverID = ctx.guildId!;
  const focus = ctx.options.getFocused(false).toLowerCase();

  const entries = await searchSpecialEvents(serverID, focus);

  const choices = entries.map((e) => ({
    name: e.title,
    value: e.name,
  }));

  await ctx.respond(choices);
}
