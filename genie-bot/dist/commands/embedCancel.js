import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
var embedCancel_default = commandModule({
  type: CommandType.Button,
  name: "embed_cancel",
  // matches customId in your “Cancel” button
  async execute(ctx) {
    draftCache.delete(ctx.user.id);
    return ctx.update({
      content: "<:x_genie:1376727488822247444> Embed creation canceled.",
      embeds: [],
      components: []
    });
  }
});
export {
  embedCancel_default as default
};
