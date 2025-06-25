import { commandModule, CommandType } from "@sern/handler";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
var cancel_default = commandModule({
  type: CommandType.Button,
  name: "cancel",
  // matches customId in your “Cancel” button
  async execute(ctx) {
    eventDrafts.delete(ctx.user.id);
    return ctx.update({
      content: "<:r_x:1376727384056922132> canceled event-management.",
      embeds: [],
      components: []
    });
  }
});
export {
  cancel_default as default
};
