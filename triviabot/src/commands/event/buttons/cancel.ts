// src/events/embedCancel.ts
import { commandModule, CommandType } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js"; // Adjust the path as necessary
import { ButtonInteraction } from "discord.js";

export default commandModule({
  type: CommandType.Button,
  name: "cancel", // matches customId in your “Cancel” button
  async execute(ctx: ButtonInteraction) {
    // Drop the draft entirely
    eventDrafts.delete(ctx.user.id);

    // Update the ephemeral preview to show cancellation
    return ctx.update({
      content: "<:r_x:1376727384056922132> canceled event-management.",
      embeds: [],
      components: [],
    });
  },
});
