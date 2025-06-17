// src/utils/landTotalsWatcher.ts
import { Client, EmbedBuilder, ThreadChannel, Message } from "discord.js";
import landsSchema from "../models/trivia/lands-schema.js";

const THREAD_ID = process.env.LAND_TOTALS_THREAD_ID!;

export async function initLandTotalsWatcher(client: Client) {
  if (!THREAD_ID) throw new Error("Missing LAND_TOTALS_THREAD_ID in .env");

  // 1) Fetch thread & its starter (master) message
  const raw = await client.channels.fetch(THREAD_ID);
  if (!(raw instanceof ThreadChannel))
    throw new Error(`Channel ${THREAD_ID} is not a thread.`);
  const thread = raw as ThreadChannel;

  let masterMsg = await thread.fetchStarterMessage().catch(() => null);
  if (!masterMsg) {
    const init = new EmbedBuilder()
      .setTitle("Land Totals")
      .setDescription("Initializing…")
      .setColor("Orange");
    masterMsg = await thread.send({ embeds: [init] });
  }

  // 2) Snapshot initial totals
  let lastTotals = Object.fromEntries(
    (await landsSchema.find().lean()).map((l) => [l.name, l.totalPoints])
  );

  // 3) Placeholders for diff message and first‐run flag
  let diffMsg: Message | null = null;
  let isFirstRun = true;
  let debounce: NodeJS.Timeout | null = null;

  // 4) Refresh function
  async function refresh() {
    // fetch & sort
    const current = await landsSchema.find().sort({ totalPoints: -1 }).lean();

    // build diff embed
    const diffEmbed = new EmbedBuilder()
      .setTitle("Land Total Updates")
      .setColor("Orange")
      .setFields(
        current.map((l) => {
          const prev = lastTotals[l.name] ?? 0;
          return {
            name: l.name,
            value: `${prev.toLocaleString()} → ${l.totalPoints.toLocaleString()} ${
              l.emojiID
            }`,
            inline: false,
          };
        })
      );

    // only after the very first run do we send/edit the diff
    if (!isFirstRun) {
      if (!diffMsg) {
        diffMsg = await thread.send({ embeds: [diffEmbed] });
      } else {
        await diffMsg.edit({ embeds: [diffEmbed] });
      }
    }

    // rebuild & edit master embed
    const masterEmbed = new EmbedBuilder()
      .setTitle("Land Totals")
      .setColor("Orange")
      .setFields(
        current.map((l) => ({
          name: l.name,
          value: `${l.totalPoints.toLocaleString()} ${l.emojiID}`,
          inline: false,
        }))
      );
    await masterMsg!.edit({ embeds: [masterEmbed] });

    // flip first-run and update snapshot
    isFirstRun = false;
    lastTotals = Object.fromEntries(
      current.map((l) => [l.name, l.totalPoints])
    );
  }

  // 5) Watch with debounce
  const stream = landsSchema.watch([], { fullDocument: "updateLookup" });
  stream.on("change", () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      refresh().catch(console.error);
      debounce = null;
    }, 500);
  });

  // 6) Initial build
  await refresh();
}
