import {
  Client,
  TextChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import BirthdayClaim from "../../models/core/birthday-schema.js";
import { tsET } from "../tsET.js";

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

export async function runBirthdayAnnouncer(client: Client) {
  const guildId = process.env.GUILD_ID2!;
  const celebrateChannelId = process.env.CELEBRATE_CHANNEL_ID!;
  const birthdayRoleId = process.env.BIRTHDAY_ROLE_ID!;
  const communityRoleId = process.env.BIRTHDAY_COMMUNITY_ROLE_ID!;
  const economyLogChannelId = process.env.ECONOMY_LOG_CHANNEL_ID!;

  const guild = await client.guilds.fetch(guildId);

  let birthdaysFound = 0;

  const birthdayRole = await guild.roles
    .fetch(birthdayRoleId)
    .catch(() => null);

  const channel = (await guild.channels
    .fetch(celebrateChannelId)
    .catch(() => null)) as TextChannel | null;

  if (!birthdayRole || !channel) {
    return { posted: false, birthdaysFound };
  }

  const dayKey = getDayKeyET();

  // Try role members from cache first
  let birthdayMembers = Array.from(birthdayRole.members.values());
  birthdaysFound = birthdayMembers.length;

  if (birthdaysFound === 0) {
    console.log(
      `${tsET()} -> [birthday] role cache empty, attempting guild.members.fetch()`,
    );
    try {
      // Request guild members (no presences, no query, limit 0 = all chunks)
      await guild.members.fetch({ withPresences: false });
      console.log(`${tsET()} -> [birthday] guild.members.fetch() succeeded`);
    } catch (err) {
      console.error(`${tsET()} -> [birthday] members.fetch FAILED`, err);
      // If Discord rate limits, just bail quietly and let the next scheduled run pick it up.
      return { posted: false, birthdaysFound };
    }

    const refreshedRole = await guild.roles
      .fetch(birthdayRoleId)
      .catch(() => null);
    birthdayMembers = Array.from(refreshedRole?.members.values() ?? []);

    birthdaysFound = birthdayMembers.length;
    console.log(
      `${tsET()} -> [birthday] after fetch birthdaysFound=${birthdaysFound}`,
    );
  }

  if (birthdaysFound === 0) return { posted: false, birthdaysFound };

  // --- DAILY GATE (single post per dayKey) ---
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // keep 48h for safety

  const dailyRec = await BirthdayClaim.findOneAndUpdate(
    { guildId: guild.id, userId: "daily", dayKey },
    {
      $setOnInsert: {
        posted: false,
        claimed: false,
        channelId: channel.id,
        expiresAt, // TTL only on daily gate docs
      },
    },
    { upsert: true, new: true },
  );

  if (dailyRec.posted) {
    return { posted: false, birthdaysFound };
  }

  // Ensure each birthday user has a claim record for today
  for (const member of birthdayMembers) {
    await BirthdayClaim.findOneAndUpdate(
      { guildId: guild.id, userId: member.id, dayKey },
      {
        $setOnInsert: { posted: false, claimed: false, channelId: channel.id },
      },
      { upsert: true, new: true },
    );
  }

  // Mention all birthday users in ONE post
  const birthdayMentions = birthdayMembers.map((m) => `<@${m.id}>`).join(", ");
  const content = `${birthdayMentions}!\n<@&${communityRoleId}>`;

  const embed1 = new EmbedBuilder()
    .setColor("#ffd966")
    .setImage(
      "https://cdn.discordapp.com/attachments/1467969861715230965/1467969878999826493/8e9ecad4b64fb190f5d749bfaeba2d499a117e5a458e412e7a098a7cf64bd1b4.png?ex=698250fc&is=6980ff7c&hm=ed4aac51959e46aca2d492257fa95c8ad2bd2528a8602109a2c3c4c5adcd860e&",
    );

  const embed = new EmbedBuilder()
    .setColor("#ffd966")
    .setDescription(
      [
        `# Oh boy! We got ears, say cheers!`,
        "*Remember, no matter how big or small your dreams are, you can always make them come true with a little bit of magic and a whole lot of heart. Keep on smiling, stay positive, and always spread magic wherever you go!*",
        "",
        "> <:fk_cake:1279153386754805830> As a special gift from the Royals, click the button below to claim your birthday jewels!",
        "",
        "We are so excited to celebrate your birthday here in Fantasy Kingdom! Thank you for being a part of this community, we hope you have a magical day!",
        "",
      ].join("\n"),
    )
    .setImage(
      "https://cdn.discordapp.com/attachments/1467969861715230965/1467970194847826166/67b7f78d4e10db899f923bc18674cd1a4e1bd653e353b5590a9f299d447df91e.png?ex=69825148&is=6980ffc8&hm=8d4c55d4372e54c1f93057291afda9a05505ecc04c30f614f57b957776612ff2&",
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`birthday_claim:${dayKey}`)
      .setLabel("Claim Birthday Jewels")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("<:fk_cake:1279153386754805830>"),
    new ButtonBuilder()
      .setCustomId(`birthday_wish:${dayKey}`)
      .setLabel("Send Birthday Wish")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("<:fk_colorsparkles:1367215313309138995>"),
  );

  const msg = await channel.send({
    content,
    embeds: [embed1, embed],
    components: [row],
    allowedMentions: {
      users: birthdayMembers.map((m) => m.id),
      roles: [communityRoleId],
    },
  });

  await BirthdayClaim.updateOne(
    { _id: dailyRec._id },
    { $set: { posted: true, messageId: msg.id, channelId: channel.id } },
  );

  // Log announcer post (best-effort)
  try {
    const log = client.channels.cache.get(economyLogChannelId) as
      | TextChannel
      | undefined;
    log?.send(
      `<:v_opie:1376727584435474542> Birthday post created for ${birthdaysFound} user(s).`,
    );
  } catch {}

  return { posted: true, birthdaysFound };
}
