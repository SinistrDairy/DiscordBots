import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import {
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  MessageFlags,
} from "discord.js";
import BirthdayClaim from "../../models/core/birthday-schema.js";

const TEST_GUILD_ID = process.env.GUILD_ID1!; // set this
const COMMUNITY_ROLE_ID = "1364310856279658717";
function getDayKeyET(): string {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const y = et.getFullYear();
  const m = String(et.getMonth() + 1).padStart(2, "0");
  const d = String(et.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default commandModule({
  name: "birthday-test",
  description: "DEV: Post a test birthday message with buttons in this channel",
  type: CommandType.Slash,

  plugins: [
    publishConfig({
      guildIds: [TEST_GUILD_ID],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
  ],

  options: [
    {
      name: "user",
      description: "User to simulate as the birthday person",
      type: 6, // USER
      required: true,
    },
    {
      name: "reset",
      description: "Reset today’s birthday state for that user",
      type: 5, // BOOLEAN
      required: false,
    },
  ],

  execute: async (ctx) => {
    if (!ctx.guildId || ctx.guildId !== TEST_GUILD_ID) {
      return ctx.reply({
        content: "This command is only enabled in the test guild.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!ctx.channel || ctx.channel.type !== 0) {
      return ctx.reply({
        content: "Run this command in a server text channel.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetUser = ctx.options.getUser("user", true);
    const reset = ctx.options.getBoolean("reset") ?? false;

    const dayKey = getDayKeyET();
    const channel = ctx.channel as TextChannel;

    if (reset) {
      await BirthdayClaim.deleteOne({
        guildId: ctx.guildId,
        userId: targetUser.id,
        dayKey,
      });
    }

    const rec = await BirthdayClaim.findOneAndUpdate(
      { guildId: ctx.guildId, userId: targetUser.id, dayKey },
      {
        $setOnInsert: { posted: false, claimed: false, channelId: channel.id },
      },
      { upsert: true, new: true },
    );

    if (rec.posted && !reset) {
      return ctx.reply({
        content:
          "Already posted today for that user. Use reset:true to repost.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const content = `🎂 It's your day, <@${targetUser.id}>!\n<@&${COMMUNITY_ROLE_ID}>`;

    const embed = new EmbedBuilder()
      .setColor("#ffd966")
      .setDescription(
        [
          `# Oh boy! We got ears, say cheers!`,
          "*Remember, no matter how big or small your dreams are, you can always make them come true with a little bit of magic and a whole lot of heart. Keep on smiling, stay positive, and always spread magic wherever you go!*",
          "",
          "> 🎁 As a special gift from the Royals, click the button below to claim your birthday jewels:",
          "",
          "We are so excited to celebrate your birthday here in Fantasy Kingdom! Thank you for being a part of this community, we hope you have a magical day!",
          "",
        ].join("\n"),
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`birthday_claim:${targetUser.id}:${dayKey}`)
        .setLabel("Claim Birthday Jewels")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🎁"),
      new ButtonBuilder()
        .setCustomId(`birthday_wish:${targetUser.id}:${dayKey}`)
        .setLabel("Send Birthday Wish")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("💬"),
    );

    const msg = await channel.send({
      content,
      embeds: [embed],
      components: [row],
      allowedMentions: {
        users: [targetUser.id],
        roles: [COMMUNITY_ROLE_ID],
      },
    });

    await BirthdayClaim.updateOne(
      { _id: rec._id },
      {
        $set: {
          posted: true,
          messageId: msg.id,
          channelId: channel.id,
          claimed: false,
          claimedAt: "",
        },
      },
    );

    // Public log
    const log = ctx.client.channels.cache.get(
      "1368568447822467102",
    ) as TextChannel;
    log?.send(
      `<:v_opie:1376727584435474542> ${ctx.user.globalName} has a birthday today.`,
    );

    return ctx.reply({
      content: `✅ Test birthday message posted for ${targetUser.tag} in this channel.`,
      flags: MessageFlags.Ephemeral,
    });
  },
});
