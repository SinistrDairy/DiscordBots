import { CommandType, commandModule } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
var cancel_default = commandModule({
  name: "preview_cancel",
  type: CommandType.Button,
  async execute(ctx) {
    eventDrafts.delete(ctx.user.id);
    return ctx.update({
      content: "\u274C Event creation canceled.",
      embeds: [],
      components: []
    });
  }
});
export {
  cancel_default as default
};
