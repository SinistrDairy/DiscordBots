// src/events/landWatcher.ts
import { eventModule, EventType } from "@sern/handler";
import { initLandTotalsWatcher } from "../utils/landTotalsWatcher.js";
import { Client } from "discord.js";

export default eventModule({
  type: EventType.Discord,
  name: "ready",
  once: true,

  execute: async (client: Client) => {
    await initLandTotalsWatcher(client);
  },
});
// This event initializes the land totals watcher when the bot is ready.
// It uses the `initLandTotalsWatcher` function from the utils to set up the watcher
// for land totals, which will monitor changes and update the totals accordingly.
// This is useful for keeping track of land ownership and changes in a game or application context.
// The watcher will likely listen for specific events or changes in the database
// related to land ownership and update the totals in real-time or at regular intervals.
// This helps maintain accurate and up-to-date information about land ownership,
