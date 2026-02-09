import {
  ButtonInteraction,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  TextChannel,
} from "discord.js";
import BirthdayClaim from "../../models/core/birthday-schema.js";
import landSchema from "../../models/profiles/lands-schema.js";
import { addPointsToUserLand } from "../economy/addPointsToLand.js";
import { logJewelsFromInteraction } from "../economy/log-jewels.js";
import {
  getRemainingCooldownFromInteraction,
  setCooldownFromInteraction,
} from "../cooldown-int.js";

const BIRTHDAY_ROLE_ID = process.env.BIRTHDAY_ROLE_ID!;

const MIN_JEWELS = 100;
const MAX_JEWELS = 200;

const WISHES = [
  `Happy Birthday! 🎉🎊`,
  `Happy Level Up Day! ☝️`,
  "You make the world a brighter place just by being in it. Happy Birthday! ❤️",
  `Here's to another year of greatness! 🥳`,
  "Hope you roll only crits today. 🎯",
  `That's the funny thing about birthdays, they're kind of an annual thing.`,
  `BEST. DAY. EVER!`,
  `The most fantastic, magical things can happen, and it all starts with a wish.`,
  `Growing old is mandatory, but growing up is optional.`,
  `Some days call for extra sparkle.✨✨`,
  `May the fork be with you. Let's eat cake.`,
];

function rollWish(): string {
  return WISHES[Math.floor(Math.random() * WISHES.length)];
}

export async function handleBirthdayButtons(
  interaction: ButtonInteraction,
): Promise<boolean> {
  const id = interaction.customId;

  const isClaim = id.startsWith("birthday_claim:");
  const isWish = id.startsWith("birthday_wish:");
  if (!isClaim && !isWish) return false;

  const parts = interaction.customId.split(":");
  if (parts.length !== 2) return false;

  const [action, dayKey] = parts;

  const targetUserId = interaction.user.id;

  // -------------------------
  // WISH BUTTON: anyone can use (public)
  // -------------------------
  if (isWish) {
    await interaction.deferUpdate().catch(() => {});

    //cooldown
    const remaining = await getRemainingCooldownFromInteraction(
      "birthday_wish",
      interaction,
    );

    if (remaining > 0) return true;

    await setCooldownFromInteraction("birthday_wish", interaction, "24h");

    const wish = rollWish();

    // Only do public wishes in guild channels
    if (!interaction.guild) return true;

    // Fetch a full channel object (avoids partial unions)
    const ch = await interaction.guild.channels
      .fetch(interaction.channelId)
      .catch(() => null);

    // Must be a text-based guild channel (TextChannel/Thread/Announcement)
    if (
      !ch ||
      ch.type === ChannelType.GuildVoice ||
      ch.type === ChannelType.GuildStageVoice
    ) {
      return true;
    }

    // At this point, TS is still picky, so we use isTextBased()
    if ("isTextBased" in ch && ch.isTextBased()) {
      await ch.send({
        content: `<:fk_colorsparkles:1367215313309138995>**${wish}**\n*— from: <@${interaction.user.id}>*`,
        allowedMentions: { users: [interaction.user.id] },
      });
    }

    return true;
  }

  // -------------------------
  // CLAIM BUTTON: birthday user only + must have Birthday role
  // -------------------------
  if (isClaim) {
    // ACK immediately, silently
    await interaction.deferUpdate().catch(() => {});

    if (!interaction.guildId || !interaction.guild) {
      await interaction
        .followUp({
          content: "This button can only be used in a server.",
          ephemeral: true,
        })
        .catch(() => {});
      return false;
    }

    // Must be the intended target user
    if (interaction.user.id !== targetUserId) {
      await interaction
        .followUp({
          content: "🎂 This birthday claim isn’t for you.",
          ephemeral: true,
        })
        .catch(() => {});
      return false;
    }

    // Must still have the birthday role
    const member =
      interaction.guild.members.cache.get(interaction.user.id) ??
      (await interaction.guild.members
        .fetch(interaction.user.id)
        .catch(() => null));

    if (!member) {
      await interaction
        .followUp({
          content: "I couldn’t find your member record in this server.",
          ephemeral: true,
        })
        .catch(() => {});
      return false;
    }

    // Atomic claim gate (once per dayKey)
    const rec = await BirthdayClaim.findOneAndUpdate(
      {
        guildId: interaction.guildId!,
        userId: targetUserId,
        dayKey,
        claimed: false,
      },
      { $set: { claimed: true, claimedAt: new Date() } },
      { new: true },
    );

    if (!rec) return true;

    const jewels =
      Math.floor(Math.random() * (MAX_JEWELS - MIN_JEWELS + 1)) + MIN_JEWELS;

    const res = await addPointsToUserLand(
      interaction.user.id,
      interaction.guildId,
      jewels,
    );

    if (!res.ok) {
      // Roll back claim if economy failed
      await BirthdayClaim.updateOne(
        { _id: rec._id },
        { $set: { claimed: false }, $unset: { claimedAt: "" } },
      );
      return true;
    }

    // Fetch channel safely
    const ch = await interaction.guild.channels
      .fetch(interaction.channelId)
      .catch(() => null);

    if (!ch || !("isTextBased" in ch) || !ch.isTextBased()) return true;

    const embed = new EmbedBuilder()
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1467969861715230965/1467972581549150454/EmojiBlitzBirthdayBabyPluto-PowerUp.webp?ex=69825381&is=69810201&hm=fbbb24452f77fb52a5e423f4687f9717db05abe48b92df403a252302ec682a13&",
      )
      .setColor("#ffd966")
      .setDescription(
        `## Hip, hip, hooray! <@${targetUserId}> has received __**${jewels}**__ <:fk_jewel:1333402533439475743>! Happy Birthday!`,
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/1467969861715230965/1467970194847826166/67b7f78d4e10db899f923bc18674cd1a4e1bd653e353b5590a9f299d447df91e.png?ex=69825148&is=6980ffc8&hm=8d4c55d4372e54c1f93057291afda9a05505ecc04c30f614f57b957776612ff2&",
      );

    // PUBLIC POST (not an interaction reply)
    await ch.send({
      embeds: [embed],
      allowedMentions: { users: [targetUserId] },
    });

    // Public log
    const awardRes = await logJewelsFromInteraction(interaction, {
      jewels: jewels,
      source: "birthday",
    });

    return true;
  }

  return true;
}
