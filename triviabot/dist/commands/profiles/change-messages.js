import {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import messageSchema from "../../models/profiles/message-schema.js";
import { publishConfig } from "@sern/publisher";
var change_messages_default = commandModule({
  name: "update-messages",
  description: `Use this command to update the messages for events.`,
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "messages",
      description: `Which message would you like to update?`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused();
          const messages = await messageSchema.find({});
          const messageNames = [];
          for (const results of messages) {
            messageNames.push(results.title);
          }
          const filter = messageNames.filter((t) => t.startsWith(focus));
          await ctx.respond(
            filter.map((title) => ({ name: title, value: title }))
          );
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "options",
      description: "What part of the message would you like to change?",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused();
          await ctx.respond(
            ["body", "emojiID", "tags"].map((choice) => ({
              name: choice,
              value: choice
            }))
          );
        }
      }
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "change",
      description: "What is the new change you are making?",
      required: true
    }
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }
    const messageTitle = ctx.options.getString("messages")?.toLowerCase();
    const option = ctx.options.getString("options");
    const change = ctx.options.getString("change");
    const message = await messageSchema.find({ title: messageTitle });
    if (message) {
      if (option === "body") {
        await messageSchema.updateOne(
          { title: messageTitle },
          {
            $set: { body: change }
          },
          {}
        );
      } else if (option === "emojiID") {
        await messageSchema.updateOne(
          { title: messageTitle },
          {
            $set: { emojiID: change }
          },
          {}
        );
      } else if (option === "tags") {
        await messageSchema.updateOne(
          { title: messageTitle },
          {
            $set: { tags: change }
          },
          {}
        );
      }
    }
  }
});
export {
  change_messages_default as default
};
