import {
  PermissionsBitField,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from "discord.js";
import { CommandModule, CommandType, commandModule } from "@sern/handler";
import messageSchema from "../../models/profiles/message-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "add-message",
  description: `Use this command to add a new message.`,
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
      type: ApplicationCommandOptionType.String,
      name: "title",
      description: `Enter the name of the event`,
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "body",
      description: "Enter the body of the message",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "emoji",
      description: "Enter the emojiID",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "tags",
      description: `Enter who you would like to tag for the event separated by a comma with no spaces`,
      required: true,
    },
  ],

  execute: async (ctx) => {
    if (!ctx) {
      return;
    }
    const messageTitle = ctx.options.getString("title", true)?.toLowerCase();
    const messageBody = ctx.options.getString("body", true);
    const emojiID = ctx.options.getString("emoji", true);
    const tags = ctx.options.getString("tags", true);

    let messageData;
    try {
      messageData = await messageSchema.findOne({ title: messageTitle });
      if (!messageData) {
        let message = await messageSchema.create({
          title: messageTitle,
          body: messageBody,
          emojiID: emojiID,
          tags: tags,
          serverID: ctx.guildId,
        });
        message.save();
      }
    } catch (err) {
      console.log(err);
    }
    await ctx.reply(
      `<:v_russell:1375161867152130182> added ${messageTitle} to the list.`
    );
  },
});
