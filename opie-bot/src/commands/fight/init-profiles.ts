// src/commands/fight/init-profiles.ts
import { MessageFlags, PermissionFlagsBits } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
import Profile from "../../models/profiles/sprof-Schema.js";

export default commandModule({
  name: "init-profiles",
  description:
    "🔧 Initialize water-gun profiles for everyone in GUILD_ID2 (admin only)",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  execute: async (ctx) => {
    const targetGuildId = process.env.GUILD_ID2!;
    if (ctx.guild!.id !== targetGuildId) {
      return ctx.reply({
        content: `🚫 This must be run in guild \`${targetGuildId}\`.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // Defer so we have time to loop through members
    await ctx.interaction.deferReply({ ephemeral: true });

    const guild = await ctx.client.guilds.fetch(targetGuildId);
    const members = await guild.members.fetch();

    let created = 0;
    let already = 0;

    for (const member of members.values()) {
      if (member.user.bot) continue;

      const res = await Profile.updateOne(
        { userID: member.id, serverID: targetGuildId },
        {
          $setOnInsert: {
            userID: member.id,
            serverID: targetGuildId,
            nickname: member.displayName,
            currSprays: 0,
            wBank: 0,
            currHits: 0,
            allTimeHits: 0,
            allTimeRec: 0,
            lastSprayTime: 0,
            lastTarget: "",
          },
        },
        { upsert: true }
      );

      // driver v4+: use upsertedCount; fallback to matchedCount
      if ((res as any).upsertedCount > 0) created++;
      else already++;
    }

    // Edit the deferred reply
    await ctx.interaction.editReply({
      content:
        `<:v_opie:1376727584435474542> Profiles initialized for **${
          created + already
        }** members.\n` +
        `• Created: **${created}**\n` +
        `• Already existed: **${already}**`,
    });
  },
});
