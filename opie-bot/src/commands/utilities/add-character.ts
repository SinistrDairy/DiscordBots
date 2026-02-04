import { commandModule, CommandType } from "@sern/handler";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import characterSchema from "../../models/core/char-Schema.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";

export default commandModule({
  name: "add-character",
  type: CommandType.Slash,
  description: "Use this command to add more characters to the list.",
  
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "new-character",
      description: "The name of the character.",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "character-image",
      description: "Link to the character image.",
      required: true,
    },
  ],
  execute: async (ctx) => {
    const cName = ctx.options.getString("new-character", true);
    const cImage = ctx.options.getString("character-image", true);

    try {
      const exists = await characterSchema.findOne({ name: cName });
      if (exists) {
        return ctx.reply({
          content: `<:x_opie:1376727567461253150> Character **${cName}** already exists in the database.`,
        });
      }

      await characterSchema.create({ name: cName, image: cImage });

      return ctx.reply({
        content: `<:v_opie:1376727584435474542> Character **${cName}** added successfully!`,
      });
    } catch (err) {
      console.error("Error adding character:", err);
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> An error occurred while adding the character. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});