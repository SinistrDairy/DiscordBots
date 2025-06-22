import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var land_jewels_default = commandModule({
  name: "land-adjust",
  description: "Adjust jewel counts for a specified land.",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "land",
      description: "Name of the land to adjust",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          try {
            const focused = ctx.options.getFocused(true);
            const lands = await landsSchema.find({}, "name").lean();
            const suggestions = lands.map((l) => l.name).filter(
              (n) => n.toLowerCase().startsWith(focused.value.toLowerCase())
            ).slice(0, 25).map((name) => ({ name, value: name }));
            await ctx.respond(suggestions);
          } catch (err) {
            console.error("Autocomplete error:", err);
          }
          return;
        }
      }
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "adjustment_type",
      description: "1 to add, 2 to subtract",
      choices: [
        { name: "add", value: 1 },
        { name: "subtract", value: 2 }
      ],
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "jewels",
      description: "Number of jewels to adjust",
      required: true
    }
  ],
  execute: async (ctx) => {
    if (ctx.interaction.isAutocomplete())
      return;
    try {
      const landInput = ctx.options.getString("land", true).trim();
      const adjustment = ctx.options.getNumber("adjustment_type", true);
      const jewels = ctx.options.getNumber("jewels", true);
      const landDoc = await landsSchema.findOne({
        name: { $regex: new RegExp(`^${landInput}$`, "i") }
      });
      if (!landDoc) {
        return ctx.reply({
          content: `\u274C Land ${landInput} not found.`,
          flags: MessageFlags.Ephemeral
        });
      }
      const landName = landDoc.name;
      const incValue = adjustment === 1 ? jewels : -jewels;
      await landsSchema.updateOne(
        { name: landName },
        { $inc: { totalPoints: incValue } }
      );
      const logChannel = ctx.client.channels.cache.get(
        "1374744395563270205"
      );
      const changer = await ctx.guild.members.fetch(ctx.user.id);
      if (logChannel?.isTextBased()) {
        logChannel.send(
          `<:v_russell:1375161867152130182> ${changer.displayName} ${adjustment === 1 ? "added" : "subtracted"} ${jewels} jewels ${adjustment === 1 ? "to" : "from"} ${landName}.`
        );
      }
      await ctx.reply({
        content: `${adjustment === 1 ? "Added" : "Subtracted"} ${jewels} jewels ${adjustment === 1 ? "to" : "from"} ${landName}.`,
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error("land-adjust error:", err);
      try {
        await ctx.reply({
          content: "\u274C An error occurred while adjusting jewels.",
          flags: MessageFlags.Ephemeral
        });
      } catch {
      }
    }
  }
});
export {
  land_jewels_default as default
};
