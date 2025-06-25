import { CommandType, commandModule } from "@sern/handler";
import eventSchema from "../../../models/profiles/event-schema.js";
import { eventDrafts } from "../../../utils/eventDraftCache.js";
import { MessageFlags } from "discord.js";
var submit_default = commandModule({
  name: "save_event",
  // must match your Button’s customId
  type: CommandType.Button,
  async execute(ctx) {
    const userId = ctx.user.id;
    const draft = eventDrafts.get(userId);
    if (!draft) {
      return ctx.reply({
        content: "<:r_x:1376727384056922132> Nothing to submit\u2014your draft has expired or was never created.",
        flags: MessageFlags.Ephemeral
      });
    }
    await eventSchema.findOneAndUpdate(
      { name: draft.name },
      {
        name: draft.name,
        title: draft.title,
        daRulez: draft.daRulez,
        scoring: draft.scoring,
        pointList: draft.pointList,
        tags: draft.tags,
        serverID: draft.serverID
      },
      { upsert: true, new: true }
    );
    eventDrafts.delete(userId);
    return ctx.update({
      content: `\u2705 Event **${draft.title}** has been saved!`,
      embeds: [],
      components: []
    });
  }
});
export {
  submit_default as default
};
