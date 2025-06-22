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
//testing
