import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import {
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import BirthdayClaim from "../../../models/core/birthday-schema.js";

const GUILD_ID2 = process.env.GUILD_ID2!;

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
  name: "birthday-debug",
  description: "ADMIN: Debug birthday announcer configuration + today’s state",
  type: CommandType.Slash,

  plugins: [
    publishConfig({
      guildIds: [GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
  ],

  execute: async (ctx) => {
    if (!ctx.guildId || ctx.guildId !== GUILD_ID2) {
      return ctx.reply({
        content: "This command is only usable in the main guild.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const dayKey = getDayKeyET();

    const celebrateChannelId = process.env.CELEBRATE_CHANNEL_ID;
    const birthdayRoleId = process.env.BIRTHDAY_ROLE_ID;
    const communityRoleId = process.env.BIRTHDAY_COMMUNITY_ROLE_ID;
    const economyLogChannelId = process.env.ECONOMY_LOG_CHANNEL_ID;

    const envProblems: string[] = [];
    if (!celebrateChannelId) envProblems.push("Missing CELEBRATE_CHANNEL_ID");
    if (!birthdayRoleId) envProblems.push("Missing BIRTHDAY_ROLE_ID");
    if (!communityRoleId) envProblems.push("Missing BIRTHDAY_COMMUNITY_ROLE_ID");
    if (!economyLogChannelId) envProblems.push("Missing ECONOMY_LOG_CHANNEL_ID");

    const guild = await ctx.client.guilds.fetch(GUILD_ID2);
    await guild.members.fetch().catch(() => null);

    // Channel checks
    let celebrateChannelOk = false;
    let celebrateChannelName = "unknown";
    if (celebrateChannelId) {
      const ch = await guild.channels.fetch(celebrateChannelId).catch(() => null);
      if (ch) {
        celebrateChannelName = "name" in ch ? (ch.name ?? "unknown") : "unknown";
        celebrateChannelOk =
          ch.type === ChannelType.GuildText || ("isTextBased" in ch && ch.isTextBased());
      }
    }

    // Role checks
    let birthdayRoleOk = false;
    let birthdayCount = 0;
    let sampleBirthdays = "";
    if (birthdayRoleId) {
      const role = await guild.roles.fetch(birthdayRoleId).catch(() => null);
      if (role) {
        birthdayRoleOk = true;
        birthdayCount = role.members.size;
        const top = Array.from(role.members.values())
          .slice(0, 10)
          .map((m) => `<@${m.id}>`)
          .join(", ");
        sampleBirthdays = top || "(none)";
      }
    }

    // Daily posted gate record
    const dailyRec = await BirthdayClaim.findOne({
      guildId: GUILD_ID2,
      userId: "daily",
      dayKey,
    }).lean();

    // Claim record coverage (only meaningful if role exists)
    let missingClaimCount = 0;
    if (birthdayRoleId) {
      const role = await guild.roles.fetch(birthdayRoleId).catch(() => null);
      if (role && role.members.size > 0) {
        const ids = Array.from(role.members.keys());

        const claimDocs = await BirthdayClaim.find({
          guildId: GUILD_ID2,
          dayKey,
          userId: { $in: ids },
        })
          .select({ userId: 1 })
          .lean();

        const have = new Set(claimDocs.map((d) => d.userId));
        missingClaimCount = ids.filter((id) => !have.has(id)).length;
      }
    }

    const embed = new EmbedBuilder()
      .setColor("#ffd966")
      .setTitle("🎂 Birthday Debug")
      .setDescription(`DayKey (ET): **${dayKey}**`)
      .addFields(
        {
          name: "Env",
          value: envProblems.length ? `❌ ${envProblems.join("\n❌ ")}` : "✅ OK",
        },
        {
          name: "Celebrate Channel",
          value: celebrateChannelId
            ? `${celebrateChannelOk ? "✅" : "❌"} ${celebrateChannelName} (${celebrateChannelId})`
            : "❌ Missing CELEBRATE_CHANNEL_ID",
          inline: false,
        },
        {
          name: "Birthday Role",
          value: birthdayRoleId
            ? `${birthdayRoleOk ? "✅" : "❌"} roleId=${birthdayRoleId}\nMembers with role: **${birthdayCount}**\nSample: ${sampleBirthdays}`
            : "❌ Missing BIRTHDAY_ROLE_ID",
          inline: false,
        },
        {
          name: "Daily Post Gate (BirthdayClaim userId='daily')",
          value: dailyRec
            ? `posted: **${String(dailyRec.posted)}**\nmessageId: **${dailyRec.messageId ?? "none"}**\nchannelId: **${dailyRec.channelId ?? "none"}**`
            : "No daily record found for today (announcer likely hasn’t run yet).",
          inline: false,
        },
        {
          name: "Claim Records Coverage",
          value:
            birthdayCount === 0
              ? "No birthday users found, so no claim docs expected."
              : missingClaimCount === 0
                ? "✅ All birthday users appear to have claim docs for today."
                : `❌ Missing claim docs for **${missingClaimCount}** birthday user(s). (Announcer must create per-user claim records.)`,
          inline: false,
        },
      );

    return ctx.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
});
