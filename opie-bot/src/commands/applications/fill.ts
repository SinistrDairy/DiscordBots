// src/commands/fight/fill.ts
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import Profile from "../../models/profiles/sprof-Schema.js";
import FightState from "../../models/core/fightstate-Schema.js";
import {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  ColorResolvable,
} from "discord.js";

// ← We no longer need setTimeout; we'll rely purely on refillReadyAt
// (You can still keep setCooldown if you want to block /spray during that minute,
//  but the “real refill” happens in /spray when refillReadyAt ≤ now.)

const MAX_SHOTS = 6;

export default commandModule({
  name: "fill",
  description: "Fill your water gun (takes 1 minute to complete)",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2!]
    }),
  ],
  execute: async (ctx) => {
    const userId = ctx.user.id;
    const guild = ctx.guild!;
    const guildId = guild.id;
    const member = await guild.members.fetch(userId);
    const now = Date.now();

    const allowedChannelId = "1378866276314779779";
    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

    if (ctx.channel?.id !== allowedChannelId && !isAdmin) {
      return ctx.reply({
        content: `<:x_opie:1376727567461253150> This command can only be used in <#${allowedChannelId}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const fight = await FightState.findOne({ serverID: guildId });
    if (!fight?.active) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> The Splash Showdown hasn’t started yet! Ask an admin to run `/start-fight`.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 1) Fetch (or create) the user’s profile
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
          refillReadyAt: 0,
        });

        return ctx.reply({
          content: `🆕 You've joined the Splash Showdown! Your profile has been created and you now have **${MAX_SHOTS}** sprays.`,
          flags: MessageFlags.Ephemeral,
        });
      } catch (err) {
        console.error("Error creating profile:", err);
        return ctx.reply({
          content: "⚠️ Something went wrong creating your profile.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    // 2) If they still have sprays, refuse to refill:
    if (profile.currSprays > 0 || profile.needsRefill === false) {
      return ctx.reply({
        content: `<:x_opie:1376727567461253150> You still have **${profile.currSprays}** sprays left—no need to fill yet!`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 3) If currSprays === 0, check if a refill is already pending:
    
    if (profile.refillReadyAt && profile.refillReadyAt > now) {
      // They already asked to refill less than 1 minute ago; show countdown:
      const endTime = Math.floor(profile.refillReadyAt / 1000);
      const remaining = profile.refillReadyAt - now;

      const alreadyEmbed = new EmbedBuilder()
        .setColor("#01dddd" as ColorResolvable)
        .setTitle("REFILL ALREADY PENDING")
        .setDescription(
          [
            "<:fk_waterhose:1377697793984168016> Your refill is already in progress!",
            "",
            `⏳ Please wait until <t:${endTime}:R> before you can /spray.`,
          ].join("\n")
        );

      // Send ephemeral and schedule its deletion:
      await ctx.reply({
        embeds: [alreadyEmbed],
        flags: MessageFlags.Ephemeral,
      });

      // Delete this ephemeral roughly after the timer ends:
      setTimeout(() => {
        ctx.interaction.deleteReply().catch(() => {
          /* ignore if it’s already gone */
        });
      }, remaining + 500);

      return;
    }

    // 4) At this point, currSprays === 0 and no refill pending → start a new 1 min refill
    const refillReadyAt = now + 60_000; // 60 s from now
    profile.refillReadyAt = refillReadyAt;
    profile.needsRefill = false;
    await profile.save();

    const endTime = Math.floor(refillReadyAt / 1000);
    const remaining = refillReadyAt - now;
    const embed = new EmbedBuilder()
      .setColor("#01dddd" as ColorResolvable)
      .setTitle("REFILLING")
      .setDescription(
        [
          "<:fk_waterhose:1377697793984168016> Refilling your water gun now!",
          "",
          `Please wait <t:${endTime}:R> before trying to spray someone.`,
        ].join("\n")
      );

    await ctx.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    // Schedule deletion of this ephemeral just after the countdown hits zero
    setTimeout(() => {
      ctx.interaction.deleteReply().catch(() => {
        /* ignore if it’s already gone */
      });
    }, remaining + 500);
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID2],
  dmPermission: false,
};
