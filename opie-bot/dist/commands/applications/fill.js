import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import Profile from "../../models/profiles/sprof-Schema.js";
import FightState from "../../models/core/fightstate-Schema.js";
import {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
const MAX_SHOTS = 6;
var fill_default = commandModule({
  name: "fill",
  description: "Fill your water gun (takes 1 minute to complete)",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2]
    })
  ],
  execute: async (ctx) => {
    const userId = ctx.user.id;
    const guild = ctx.guild;
    const guildId = guild.id;
    const member = await guild.members.fetch(userId);
    const now = Date.now();
    const allowedChannelId = "1378866276314779779";
    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
    if (ctx.channel?.id !== allowedChannelId && !isAdmin) {
      return ctx.reply({
        content: `<:x_opie:1376727567461253150> This command can only be used in <#${allowedChannelId}>.`,
        flags: MessageFlags.Ephemeral
      });
    }
    const fight = await FightState.findOne({ serverID: guildId });
    if (!fight?.active) {
      return ctx.reply({
        content: "<:x_opie:1376727567461253150> The Splash Showdown hasn\u2019t started yet! Ask an admin to run `/start-fight`.",
        flags: MessageFlags.Ephemeral
      });
    }
    let profile = await Profile.findOne({ userID: userId, serverID: guildId });
    if (!profile) {
      try {
        profile = await Profile.create({
          userID: userId,
          serverID: guildId,
          nickname: member.nickname,
          currSprays: MAX_SHOTS,
          wBank: 0,
          currHits: 0,
          allTimeHits: 0,
          allTimeRec: 0,
          lastSprayTime: 0,
          lastTarget: "",
          refillReadyAt: 0
        });
        return ctx.reply({
          content: `\u{1F195} You've joined the Splash Showdown! Your profile has been created and you now have **${MAX_SHOTS}** sprays.`,
          flags: MessageFlags.Ephemeral
        });
      } catch (err) {
        console.error("Error creating profile:", err);
        return ctx.reply({
          content: "\u26A0\uFE0F Something went wrong creating your profile.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
    if (profile.currSprays > 0 || profile.needsRefill === false) {
      return ctx.reply({
        content: `<:x_opie:1376727567461253150> You still have **${profile.currSprays}** sprays left\u2014no need to fill yet!`,
        flags: MessageFlags.Ephemeral
      });
    }
    if (profile.refillReadyAt && profile.refillReadyAt > now) {
      const endTime2 = Math.floor(profile.refillReadyAt / 1e3);
      const remaining2 = profile.refillReadyAt - now;
      const alreadyEmbed = new EmbedBuilder().setColor("#01dddd").setTitle("REFILL ALREADY PENDING").setDescription(
        [
          "<:fk_waterhose:1377697793984168016> Your refill is already in progress!",
          "",
          `\u23F3 Please wait until <t:${endTime2}:R> before you can /spray.`
        ].join("\n")
      );
      await ctx.reply({
        embeds: [alreadyEmbed],
        flags: MessageFlags.Ephemeral
      });
      setTimeout(() => {
        ctx.interaction.deleteReply().catch(() => {
        });
      }, remaining2 + 500);
      return;
    }
    const refillReadyAt = now + 6e4;
    profile.refillReadyAt = refillReadyAt;
    profile.needsRefill = false;
    await profile.save();
    const endTime = Math.floor(refillReadyAt / 1e3);
    const remaining = refillReadyAt - now;
    const embed = new EmbedBuilder().setColor("#01dddd").setTitle("REFILLING").setDescription(
      [
        "<:fk_waterhose:1377697793984168016> Refilling your water gun now!",
        "",
        `Please wait <t:${endTime}:R> before trying to spray someone.`
      ].join("\n")
    );
    await ctx.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    setTimeout(() => {
      ctx.interaction.deleteReply().catch(() => {
      });
    }, remaining + 500);
  }
});
const config = {
  guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
  dmPermission: false
};
export {
  config,
  fill_default as default
};
