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
// which can be crucial for gameplay, resource management, or other functionalities
// that depend on land data.
// The watcher will also handle any necessary updates to the database or other systems
// to ensure that the land totals are always current and reflect the latest state of the game or application.
// This is particularly important in dynamic environments where land ownership can change frequently,
// such as in multiplayer games or applications with user-generated content.
// By initializing this watcher on bot startup, the application ensures that it is always ready
// to respond to changes in land ownership and maintain accurate totals.
// This can enhance user experience by providing real-time updates and reducing the need for manual checks or
// refreshes to see the current state of land ownership.
// Overall, this event plays a crucial role in maintaining the integrity and accuracy of land ownership data
// within the application, ensuring that users have access to the most current information available.
