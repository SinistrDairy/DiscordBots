// src/commands/spray.ts
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
  TextChannel,
  PermissionFlagsBits,
  ColorResolvable,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import landsSchema from "../../models/profiles/lands-schema.js";
import userSchema from "../../models/profiles/user-schema.js";
import Profile from "../../models/profiles/sprof-Schema.js";
import FightState from "../../models/core/fightstate-Schema.js";
import { getPronoun } from "../../utils/pronoun.js";

const COOLDOWN = 10_000;
const HIT_CHANCE = 0.55;
const STITCH_PROB = 0.00371923;
const CHANNELS = {
  announce: "1368568447822467102",
  allowed: "1378866276314779779",
};
const POINTS = {
  hit: 25,
  miss: 10,
  stitch: 100,
};

const IMAGES = {
  thumbnail:
    "https://emhuf.xyz/uploads/Splash_Showdown/1750365367669-13945623.png",
  stitchThumbnail:
    "https://emhuf.xyz/uploads/Splash_Showdown/1750365357200-398162764.png",
  footer:
    "https://emhuf.xyz/uploads/Splash_Showdown/1750365372826-250831930.png",
  stitchFooter:
    "https://emhuf.xyz/uploads/Splash_Showdown/1750365362072-804297575.png",
  missedThumbnail:
    "https://emhuf.xyz/uploads/Splash_Showdown/1750365779962-166341448.png",
};

export default commandModule({
  name: "spray",
  description: "Spray someone with your water gun",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2!],
    }),
  ],
  options: [
    {
      name: "target",
      description: "Who would you like to spray?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],
  execute: async (ctx) => {
    const shooterId = ctx.user.id;
    const guild = ctx.guild!;
    const targetUser = ctx.options.getUser("target", true);
    const now = Date.now();

    // Fetch both members
    const [shooterMember, targetMember] = await Promise.all([
      guild.members.fetch(shooterId),
      guild.members.fetch(targetUser.id),
    ]);
    // 4) Load shooter profile
    const shooter = await Profile.findOne({
      userID: shooterId,
      serverID: guild.id,
    });
    if (!shooter) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> Invalid user profile, please contact a moderator.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // 7) Load user profile for land points
    const userProf = await userSchema.findOne({ userID: shooterId });
    if (!userProf) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> Invalid user profile, please contact a moderator.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const isAdmin = shooterMember.permissions.has(
      PermissionFlagsBits.Administrator
    );

    // 1) Channel restriction
    if (ctx.channel?.id !== CHANNELS.allowed && !isAdmin) {
      return ctx.reply({
        content: `<:x_opie:1376727567461253150> This command can only be used in <#${CHANNELS.allowed}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // Pronoun setup (for later “stitch” embed)
    const proIDs = new Set([
      "940349186661036043", // she/her
      "940349234916503683", // he/him
      "940349439267180586", // they/them
    ]);
    const hasPronoun = shooterMember.roles.cache.find((r) => proIDs.has(r.id));
    const proRole = hasPronoun?.id;
    const subjectLower = getPronoun(proRole, {
      case: "subject",
      capitalize: false,
    });

    // 2) Ensure fight is active
    const fight = await FightState.findOne({ serverID: guild.id });
    if (!fight?.active) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> The Splash Showdown hasn’t started yet! Ask an admin to run `/start-fight`.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // 3) Prevent self or bot spraying
    if (targetUser.id === shooterId || targetUser.bot) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> Invalid target can’t spray yourself or a bot!",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 9) Prevent same‐target twice
    if (shooter.lastTarget === targetUser.id) {
      return await ctx.reply({
        content:
          "<:x_opie:1376727567461253150> Can’t spray the same person twice in a row!",
        flags: MessageFlags.Ephemeral,
      });
    }
    // 6) Out of water check
    if (shooter.needsRefill === true) {
      return await ctx.reply({
        content:
          "<:fk_waterhose:1377697793984168016> You're out of water! Use `/fill` to refill before spraying.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 5) Refill‐in‐progress check
    if (
      !shooter.needsRefill &&
      shooter.refillReadyAt &&
      shooter.refillReadyAt > now
    ) {
      const endTime = Math.floor(shooter.refillReadyAt / 1000);
      const remaining = shooter.refillReadyAt - now;
      const embed = new EmbedBuilder()
        .setColor("#01dddd" as ColorResolvable)
        .setTitle("REFILL IN PROGRESS")
        .setDescription(
          [
            "<:fk_waterhose:1377697793984168016> Your gun is still refilling!",
            "",
            `You can /spray again <t:${endTime}:R>`,
          ].join("\n")
        );

      // Send ephemeral embed and auto‐delete after actual refill time
      const replyMsg = await ctx.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(() => {
        replyMsg.delete().catch(() => {});
      }, remaining + 500);
      return;
    } else if (
      !shooter.needsRefill &&
      shooter.refillReadyAt &&
      shooter.refillReadyAt <= now
    ) {
      // 5b) Refill complete: top up
      shooter.currSprays = 6;
      shooter.refillReadyAt = 0;
      await shooter.save();
    }

    const landName = userProf.land
      .split(" ")
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

    // 8) Global cooldown check
    if (shooter.lastSprayTime && now - shooter.lastSprayTime < COOLDOWN) {
      const waitSec = Math.ceil(
        (COOLDOWN - (now - shooter.lastSprayTime)) / 1000
      );
      return ctx.reply({
        content: `Wait ${waitSec}s. You're still lining up your shot.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // — All early validation is done. Now perform the “spray” logic. —
    // 10) Defer once:
    await ctx.interaction.deferReply();

    // 11) Deduct a shot
    shooter.currSprays--;
    shooter.lastSprayTime = now;
    shooter.lastTarget = targetUser.id;
    if (shooter.currSprays <= 0) {
      shooter.currSprays = 0;
      shooter.needsRefill = true;
    }
    await shooter.save();

    // 12) Determine hit/miss/stitch
    let hit = false;
    let isStitchEvent = false;
    for (let i = 0; i < 6; i++) {
      hit = Math.random() <= HIT_CHANCE;
      isStitchEvent = !hit && Math.random() < STITCH_PROB;
    }

    // 13) Build embed
    const embed = new EmbedBuilder();
    if (hit) {
      shooter.currHits++;
      shooter.allTimeHits++;
      await shooter.save();

      await Profile.findOneAndUpdate(
        { userID: targetUser.id, serverID: guild.id },
        { $inc: { allTimeRec: 1 } },
        { upsert: true }
      );
      await landsSchema.findOneAndUpdate(
        { name: landName },
        { $inc: { totalPoints: POINTS.hit } }
      );

      embed
        .setColor("#01dddd")
        .setTitle("Ready, Aim, Fire!")
        .setDescription(
          [
            "",
            `**${shooterMember.displayName}** takes aim, and **SPLASH** <:fk_splash:1377306074423758999>`,
            "",
            `That was some good aim! **${targetMember.displayName}** is *drenched*.`,
            "",
            `-# <:fk_arrY:1377386327619801188> ${shooterMember.displayName} earned __**25**__ <:fk_jewel:1333402533439475743>`,
            `-# <:fk_arrB:1377386241187778769> Water Level: **${shooter.currSprays}**`,
          ].join("\n")
        )
        .setThumbnail(
          IMAGES.thumbnail
        )
        .setImage(
          IMAGES.footer
        );

      const feed = guild.channels.cache.get(CHANNELS.announce) as
        | TextChannel
        | undefined;
      if (feed?.isTextBased()) {
        feed.send(
          `<:v_opie:1376727584435474542> ${shooterMember.displayName} sprayed ${targetMember.displayName}!`
        );
      }
    } else if (isStitchEvent) {
      shooter.currSprays++;
      shooter.lastTarget = "";
      await shooter.save();

      await landsSchema.findOneAndUpdate(
        { name: landName },
        { $inc: { totalPoints: POINTS.stitch } }
      );

      embed
        .setColor("#6fe940")
        .setTitle("WAS THAT A DOG?!")
        .setDescription(
          [
            `**WHAM!** a *slimy blast* hits its mark!`,
            `Everyone sees **Stitch** <:stitch_tongue:1377640945159245844> running away giggling and from behind a tree, a pair of mischievous ears peek out...`,
            "",
            `<:fk_arrG:1377636867675263170> ${shooterMember.displayName} got drenched in slime, but ${subjectLower} earned __**100**__ <:fk_jewel:1333402533439475743>`,
          ].join("\n")
        )
        .setThumbnail(
          IMAGES.stitchThumbnail
        )
        .setImage(
          IMAGES.stitchFooter
        );
    } else {
      await shooter.save();
      await landsSchema.findOneAndUpdate(
        { name: landName },
        { $inc: { totalPoints: POINTS.miss } }
      );

      embed
        .setColor("#01dddd")
        .setTitle("Ready, Aim, Fire!")
        .setDescription(
          [
            "",
            `**${shooterMember.displayName}** takes aim, and misses!`,
            "",
            `**${targetMember.displayName}**, that was a close one... it might be time for some payback! <:fk_splash:1377306074423758999>`,
            "",
            `-# <:fk_arrR:1377386356048920709> ${shooterMember.displayName} has earned __**10**__ <:fk_jewel:1333402533439475743>`,
            `-# <:fk_arrB:1377386241187778769> Water Level: **${shooter.currSprays}**`,
          ].join("\n")
        )
        .setThumbnail(
          IMAGES.missedThumbnail
        )
        .setImage(
          IMAGES.footer
        );
    }

    // 14) Final response (edit the deferred “thinking…”)
    return ctx.interaction.editReply({
      content: `<@${targetUser.id}>`,
      embeds: [embed],
    });
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID2],
  dmPermission: false,
};
