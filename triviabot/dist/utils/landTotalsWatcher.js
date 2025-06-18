import { EmbedBuilder, ThreadChannel } from "discord.js";
import landsSchema from "../models/trivia/lands-schema.js";
const THREAD_ID = process.env.LAND_TOTALS_THREAD_ID;
async function initLandTotalsWatcher(client) {
  if (!THREAD_ID)
    throw new Error("Missing LAND_TOTALS_THREAD_ID in .env");
  const raw = await client.channels.fetch(THREAD_ID);
  if (!(raw instanceof ThreadChannel))
    throw new Error(`Channel ${THREAD_ID} is not a thread.`);
  const thread = raw;
  let masterMsg = await thread.fetchStarterMessage().catch(() => null);
  if (!masterMsg) {
    const init = new EmbedBuilder().setTitle("Land Totals").setDescription("Initializing\u2026").setColor("Orange");
    masterMsg = await thread.send({ embeds: [init] });
  }
  let lastTotals = Object.fromEntries(
    (await landsSchema.find().lean()).map((l) => [l.name, l.totalPoints])
  );
  let diffMsg = null;
  let isFirstRun = true;
  let debounce = null;
  async function refresh() {
    const current = await landsSchema.find().sort({ totalPoints: -1 }).lean();
    const diffEmbed = new EmbedBuilder().setTitle("Land Total Updates").setColor("Orange").setFields(
      current.map((l) => {
        const prev = lastTotals[l.name] ?? 0;
        return {
          name: l.name,
          value: `${prev.toLocaleString()} \u2192 ${l.totalPoints.toLocaleString()} ${l.emojiID}`,
          inline: false
        };
      })
    );
    if (!isFirstRun) {
      if (!diffMsg) {
        diffMsg = await thread.send({ embeds: [diffEmbed] });
      } else {
        await diffMsg.edit({ embeds: [diffEmbed] });
      }
    }
    const masterEmbed = new EmbedBuilder().setTitle("Land Totals").setColor("Orange").setFields(
      current.map((l) => ({
        name: l.name,
        value: `${l.totalPoints.toLocaleString()} ${l.emojiID}`,
        inline: false
      }))
    );
    await masterMsg.edit({ embeds: [masterEmbed] });
    isFirstRun = false;
    lastTotals = Object.fromEntries(
      current.map((l) => [l.name, l.totalPoints])
    );
  }
  const stream = landsSchema.watch([], { fullDocument: "updateLookup" });
  stream.on("change", () => {
    if (debounce)
      clearTimeout(debounce);
    debounce = setTimeout(() => {
      refresh().catch(console.error);
      debounce = null;
    }, 500);
  });
  await refresh();
}
export {
  initLandTotalsWatcher
};
