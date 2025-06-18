import { eventModule, EventType } from "@sern/handler";
import { initLandTotalsWatcher } from "../utils/landTotalsWatcher.js";
var landWatcher_default = eventModule({
  type: EventType.Discord,
  name: "ready",
  once: true,
  execute: async (client) => {
    await initLandTotalsWatcher(client);
  }
});
export {
  landWatcher_default as default
};
