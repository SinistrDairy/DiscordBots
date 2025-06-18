import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
import { requirePermission } from "../../plugins/requirePermission.js";
const DEVELOPER_IDS = ["239426866157453313"];
var delete_commands_default = commandModule({
  name: "delete-command",
  description: "Developer only: Delete a slash command by its command ID",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator])
  ],
  options: [
    {
      name: "command_id",
      description: "The ID of the command to delete",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "guild_id",
      description: "Optional guild ID if deleting a guild command",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  execute: async (ctx) => {
    if (!DEVELOPER_IDS.includes(ctx.user.id)) {
      return ctx.reply({
        content: "\u26D4 You do not have permission to run this command.",
        flags: MessageFlags.Ephemeral
      });
    }
    const commandId = ctx.options.getString("command_id", true);
    const guildId = ctx.options.getString("guild_id");
    try {
      if (guildId) {
        const guild = await ctx.client.guilds.fetch(guildId);
        if (!guild) {
          return ctx.reply({
            content: `\u274C Guild with ID \`${guildId}\` not found.`,
            flags: MessageFlags.Ephemeral
          });
        }
        await guild.commands.delete(commandId);
        return ctx.reply({
          content: `\u2705 Deleted guild command with ID \`${commandId}\` from guild \`${guildId}\`.`,
          flags: MessageFlags.Ephemeral
        });
      } else {
        const app = ctx.client.application;
        if (!app) {
          return ctx.reply({
            content: "\u274C Discord application not ready yet. Try again later.",
            flags: MessageFlags.Ephemeral
          });
        }
        await app.commands.delete(commandId);
        return ctx.reply({
          content: `\u2705 Deleted global command with ID \`${commandId}\`.`,
          flags: MessageFlags.Ephemeral
        });
      }
    } catch (error) {
      return ctx.reply({
        content: `\u274C Failed to delete command: \`${error.message}\``,
        flags: MessageFlags.Ephemeral
      });
    }
  }
});
export {
  delete_commands_default as default
};
