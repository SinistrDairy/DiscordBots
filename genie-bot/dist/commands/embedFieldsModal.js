import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../utils/embedDraftCache.js";
import {
  MessageFlags
} from "discord.js";
import { buildFlowMenu } from "../utils/embedMenuOpt.js";
var embedFieldsModal_default = commandModule({
  type: CommandType.Modal,
  name: "embedFieldsModal",
  async execute(ctx) {
    const draft = draftCache.get(ctx.user.id);
    if (!draft) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> No draft found.",
        flags: MessageFlags.Ephemeral
      });
    }
    const json = ctx.fields.getTextInputValue("fields_json");
    let arr;
    try {
      arr = JSON.parse(json);
    } catch {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> Invalid JSON.",
        flags: MessageFlags.Ephemeral
      });
    }
    if (!Array.isArray(arr)) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> JSON must be an array.",
        flags: MessageFlags.Ephemeral
      });
    }
    draft.embed.spliceFields(0, draft.embed.data.fields?.length ?? 0);
    for (const f of arr) {
      draft.embed.addFields({
        name: String(f.name),
        value: String(f.value),
        inline: Boolean(f.inline)
      });
    }
    draftCache.set(ctx.user.id, draft);
    const menuRow = buildFlowMenu(draft.flow);
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    return ctx.editReply({
      embeds: [draft.embed],
      components: [menuRow]
    });
  }
});
export {
  embedFieldsModal_default as default
};
