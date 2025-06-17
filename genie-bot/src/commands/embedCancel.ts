// src/events/embedCancel.ts
import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import { ButtonInteraction } from "discord.js";

export default commandModule({
  type: CommandType.Button,
  name: "embed_cancel", // matches customId in your “Cancel” button
  async execute(ctx: ButtonInteraction) {
    // Drop the draft entirely
    draftCache.delete(ctx.user.id);

    // Update the ephemeral preview to show cancellation
    return ctx.update({
      content: "<:x_genie:1376727488822247444> Embed creation canceled.",
      embeds: [],
      components: [],
    });
  },
});
