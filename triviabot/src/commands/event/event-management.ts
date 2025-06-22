import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "event-management",
  description: "🛠 Create, list, edit or delete your custom events",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
  ],

  options: [
    {
      name: "create",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Create a new event",
    },
    {
      name: "list",
      type: ApplicationCommandOptionType.Subcommand,
      description: "List all events",
    },
    {
      name: "delete",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Delete an existing event",
    },
  ],

  async execute(ctx) {
    switch (ctx.options.getSubcommand()) {
      case "create":
        return console.log("Create event command executed");
      case "list":
        return console.log("List events command executed");
      case "delete":
        return console.log("Delete event command executed");
    }
  },
});
