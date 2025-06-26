import { ActionRowBuilder, ApplicationCommandOptionType, MessageFlags, PermissionFlagsBits, StringSelectMenuBuilder } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
import { suggestEvents } from "../../utils/suggestEvents.js";
import eventSchema from "../../models/profiles/event-schema.js";

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
    {
      name: "edit",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Edit an existing event",
    }
  ],

  async execute(ctx) {

    switch (ctx.options.getSubcommand()) {
      case "create":
        return console.log("Create event command executed");
      case "list":
        return console.log("List events command executed");
      case "delete":
        return console.log("Delete event command executed");
      case "edit":
        {
          // Step 2: fetch all events for this guild
          const events = await eventSchema
          .find({serverID: "830604135748337673"})
          .select("name")
          .sort({name: 1})
          .lean();

          if (!events.length) {
            return ctx.reply({
              content: "<:r_x:1376727384056922132> No events to edit.",
              flags: MessageFlags.Ephemeral,
            });
          }

          // Build a dropdown of every event
          const menu = new StringSelectMenuBuilder()
            .setCustomId("editSelectEvent")
            .setPlaceholder("Select an event to edit…")
            .addOptions(
              events.map((e) => ({
                label: e.name,
                value: e.name,
              }))
            );

          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            menu
          );
          return ctx.reply({
            content: "",
            components: [row],
          });
        }
    }
  },
});
