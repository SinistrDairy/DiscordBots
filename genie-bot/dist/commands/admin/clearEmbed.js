import { commandModule, CommandType } from "@sern/handler";
import { draftCache } from "../../utils/embedDraftCache.js";
import { MessageFlags, PermissionFlagsBits } from "discord.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
var clearEmbed_default = commandModule({
  name: "clear-embeds",
  description: "Clear all in-progress embed drafts",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2]
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator])
  ],
  execute: async (ctx) => {
    draftCache.clear();
    return ctx.reply({
      content: "\u{1F5D1}\uFE0F Cleared all embed drafts.",
      flags: MessageFlags.Ephemeral
    });
  }
});
const config = {
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator]
};
export {
  config,
  clearEmbed_default as default
};
