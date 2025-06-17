// src/commands/preview_cancel.ts
import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";

export default commandModule({
  name: "preview_cancel",
  type: CommandType.Button,
  async execute(ctx) {
    eventDrafts.delete(ctx.user.id);
    return ctx.update({
      content: "❌ Event creation canceled.",
      embeds: [],
      components: [],
    });
  },
});
