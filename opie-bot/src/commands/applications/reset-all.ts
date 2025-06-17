import { CommandType, commandModule } from "@sern/handler";
import {
  PermissionsBitField,
  MessageFlags,
  GuildMember,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";
import braceletProf from "../../models/profiles/bprof-Schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "reset-user-profiles",
  description:
    "Resets collected beads and marks user profiles as incomplete (admins only).",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  execute: async (ctx) => {
    // Only allow Admins to execute this command
    const member = ctx.member as GuildMember;

    if (!member) {
      await ctx.reply({
        content: "❌ You must be a member of the server to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {}), 10000);
      const channel = ctx.client.channels.cache.get(
        "1368568447822467102"
      ) as TextChannel;

      if (channel) {
        channel.send(
          `❌ ${ctx.user.displayName} attempted to use this command.`
        );
      } else {
        console.error("Channel not found");
      }
      return;
    }
    // Check if the member has the Administrator permission
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await ctx.reply({
        content: "❌ You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {}), 10000);

      const channel = ctx.client.channels.cache.get(
        "1368568447822467102"
      ) as TextChannel;

      if (channel) {
        channel.send(
          `❌ ${ctx.user.displayName} is not an Admin. They are attempting to use this command.`
        );
      } else {
        console.error("Channel not found");
      }
      return;
    }

    try {
      // Perform the reset operation on all user profiles (keep bLetters, bShapes, and serverID intact)
      const result = await braceletProf.updateMany(
        {}, // Empty filter to apply to all profiles
        {
          $set: {
            // Reset the collected beads and isComplete field, but keep bLetters, bShapes, and serverID intact
            letters: [],
            shapes: [],
            isComplete: false,
          },
        }
      );

      // Check if any profiles were modified
      if (result.modifiedCount > 0) {
        await ctx.reply({
          content: `<:v_opie:1376727584435474542> All user profiles have been reset. Total profiles modified: ${result.modifiedCount}`,
          flags: MessageFlags.Ephemeral,
        });
        const channel = ctx.client.channels.cache.get(
            "1368568447822467102"
          ) as TextChannel;
    
          if (channel) {
            channel.send(
              `<:v_opie:1376727584435474542> ${ctx.user.displayName} has reset all user bracelet profiles.`
            );
          } else {
            console.error("Channel not found");
          }
      } else {
        await ctx.reply({
          content: "❌ No user profiles were found to reset.",
          flags: MessageFlags.Ephemeral,
        });
      }
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {}), 10000);
      
    } catch (error) {
      console.error("Error resetting profiles:", error);
      await ctx.reply({
        content:
          "❌ There was an error while trying to reset the profiles. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
      const channel = ctx.client.channels.cache.get(
        "1368568447822467102"
      ) as TextChannel;

      if (channel) {
        channel.send(
          `❌ ${ctx.user.displayName} has had an error while trying to reset all user bracelet profiles check err logs.`
        );
      } else {
        console.error("Channel not found");
      }
      setTimeout(() => ctx.interaction.deleteReply().catch(() => {}), 10000);
    }
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID], // Guild ID where this command is allowed to run
  dmPermission: false, // Disallow the command in DMs
  defaultMemberPermissions: [PermissionsBitField.Flags.Administrator], // Only admins can use this command
};
