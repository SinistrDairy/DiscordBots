import { CommandType, commandModule } from "@sern/handler";
import {
  PermissionsBitField,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
import braceletProf from "../../models/profiles/bprof-Schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
var reset_all_default = commandModule({
  name: "reset-user-profiles",
  description: "Resets collected beads and marks user profiles as incomplete (admins only).",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator])
  ],
  execute: async (ctx) => {
    const member = ctx.member;
    if (!member) {
      await ctx.reply({
        content: "\u274C You must be a member of the server to use this command.",
        flags: MessageFlags.Ephemeral
      });
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {
      }), 1e4);
      const channel = ctx.client.channels.cache.get(
        "1368568447822467102"
      );
      if (channel) {
        channel.send(
          `\u274C ${ctx.user.displayName} attempted to use this command.`
        );
      } else {
        console.error("Channel not found");
      }
      return;
    }
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await ctx.reply({
        content: "\u274C You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral
      });
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {
      }), 1e4);
      const channel = ctx.client.channels.cache.get(
        "1368568447822467102"
      );
      if (channel) {
        channel.send(
          `\u274C ${ctx.user.displayName} is not an Admin. They are attempting to use this command.`
        );
      } else {
        console.error("Channel not found");
      }
      return;
    }
    try {
      const result = await braceletProf.updateMany(
        {},
        // Empty filter to apply to all profiles
        {
          $set: {
            // Reset the collected beads and isComplete field, but keep bLetters, bShapes, and serverID intact
            letters: [],
            shapes: [],
            isComplete: false
          }
        }
      );
      if (result.modifiedCount > 0) {
        await ctx.reply({
          content: `<:v_opie:1376727584435474542> All user profiles have been reset. Total profiles modified: ${result.modifiedCount}`,
          flags: MessageFlags.Ephemeral
        });
        const channel = ctx.client.channels.cache.get(
          "1368568447822467102"
        );
        if (channel) {
          channel.send(
            `<:v_opie:1376727584435474542> ${ctx.user.displayName} has reset all user bracelet profiles.`
          );
        } else {
          console.error("Channel not found");
        }
      } else {
        await ctx.reply({
          content: "\u274C No user profiles were found to reset.",
          flags: MessageFlags.Ephemeral
        });
      }
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {
      }), 1e4);
    } catch (error) {
      console.error("Error resetting profiles:", error);
      await ctx.reply({
        content: "\u274C There was an error while trying to reset the profiles. Please try again later.",
        flags: MessageFlags.Ephemeral
      });
      const channel = ctx.client.channels.cache.get(
        "1368568447822467102"
      );
      if (channel) {
        channel.send(
          `\u274C ${ctx.user.displayName} has had an error while trying to reset all user bracelet profiles check err logs.`
        );
      } else {
        console.error("Channel not found");
      }
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {
      }), 1e4);
    }
  }
});
const config = {
  guildIds: [process.env.GUILD_ID2],
  // Guild ID where this command is allowed to run
  dmPermission: false,
  // Disallow the command in DMs
  defaultMemberPermissions: [PermissionsBitField.Flags.Administrator]
  // Only admins can use this command
};
export {
  config,
  reset_all_default as default
};
