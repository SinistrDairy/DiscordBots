// src/commands/fight/watergun-profile.ts
import { EmbedBuilder, MessageFlags, Role } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import Profile from "../../models/profiles/sprof-Schema.js";

const COOLDOWN = 5_000; // must match your spray cooldown

export default commandModule({
  name: "watergun-profile",
  description: "View your water-gun stats",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2!]
    }),
  ],
  execute: async (ctx) => {
    const userId = ctx.user.id;
    const now = Date.now();

    if (!ctx.guild) {
      return ctx.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const guild = ctx.guild;
    const guildId = guild.id;

    const member = await guild.members?.fetch(userId);
    if (!member) {
      return;
    }

    let profile;
    try {
      profile = await Profile.findOne({ userID: userId, serverID: guildId });
    } catch (err) {
      console.error("Error fetching profile:", err);
      return ctx.reply({
        content:
          "⚠️ Something went wrong retrieving your profile. Please notify a moderator.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Cooldown status
    let status: string;
    if (!profile.lastSprayTime || now - profile.lastSprayTime >= COOLDOWN) {
      status = "<:v_opie:1376727584435474542> Ready to spray!";
    } else {
      const waitSec = Math.ceil(
        (COOLDOWN - (now - profile.lastSprayTime)) / 1000
      );
      status = `⏳ Not ready yet (${waitSec}s)`;
    }

    // Resolve lastTarget username
    let lastTargetName = "None";
    if (profile.lastTarget) {
      try {
        const member = await ctx.guild!.members.fetch(profile.lastTarget);
        lastTargetName = member.displayName;
      } catch {
        lastTargetName = profile.lastTarget; // fallback to ID
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${member.displayName}’s Water-Gun Profile`)
      .setColor("#01dddd")
      .setDescription(
        [
          "__**<:fk_arrB:1377386241187778769> Water Level**__",
          `> ${profile.currSprays}`,
          "",
          "__**<:fk_arrR:1377386356048920709> Last Target**__",
          `> ${lastTargetName}`,
          "",
          "__**<:fk_arrT:1377386293012463626> Status**__",
          `> ${status}`,
          "",
          "__**<:fk_arrY:1377386327619801188> Total Hits**__",
          `> ${profile.allTimeHits}`,
        ].join("\n")
      )
      .setThumbnail(`${member.displayAvatarURL()}`)
      .setImage(
        "https://emhuf.xyz/uploads/Splash_Showdown/1750365372826-250831930.png"
      );

    await ctx.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID2],
  dmPermission: false,
  // defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
};
