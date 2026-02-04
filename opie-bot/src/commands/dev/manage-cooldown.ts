// src/commands/admin/cooldowns.ts
import { commandModule, CommandType } from "@sern/handler";
import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import CooldownModel from "../../models/core/cooldown-Schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

const DEVELOPER_IDS = ["239426866157453313"];

export default commandModule({
  name: "manage-cooldowns",
  description: "Dev: list and clear active cooldowns",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  options: [
    {
      type: 1, // SUB_COMMAND
      name: "list",
      description: "List active cooldowns",
      options: [
        {
          type: 3, // STRING
          name: "game",
          description: "Optional COMMAND_NAME to filter (e.g., garden, mine)",
          required: false,
        },
      ],
    },
    {
      type: 1, // SUB_COMMAND
      name: "clear",
      description: "Clear cooldowns for a COMMAND_NAME (optionally one user)",
      options: [
        {
          type: 3, // STRING
          name: "game",
          description: "COMMAND_NAME to clear (e.g., garden, mine)",
          required: true,
        },
        {
          type: 6, // USER
          name: "user",
          description:
            "Optional user to clear only their cooldown for that game",
          required: false,
        },
      ],
    },
  ],

  execute: async (ctx) => {
    if (!DEVELOPER_IDS.includes(ctx.user.id)) {
      return ctx.reply({
        content: "⛔ You do not have permission to run this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const sub = ctx.options.getSubcommand(true);
    const now = new Date();

    if (sub === "list") {
      const game = ctx.options.getString("game")?.trim();
      const filter: Record<string, any> = { expires: { $gt: now } };
      if (game) filter.COMMAND_NAME = game;

      // Active cooldown docs
      const docs = await CooldownModel.find(filter)
        .select({ COMMAND_NAME: 1, userId: 1, expires: 1, _id: 0 })
        .lean();

      if (docs.length === 0) {
        return ctx.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Active Cooldowns")
              .setDescription(
                game ? `None active for **${game}**.` : "None active.",
              )
              .setColor(0x2ecc71),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      // Group by COMMAND_NAME
      const grouped = new Map<
        string,
        { count: number; soonest: Date; users: string[] }
      >();

      for (const d of docs) {
        const key = d.COMMAND_NAME;
        const entry = grouped.get(key);
        if (!entry) {
          grouped.set(key, { count: 1, soonest: d.expires, users: [d.userId] });
        } else {
          entry.count += 1;
          if (d.expires < entry.soonest) entry.soonest = d.expires;
          entry.users.push(d.userId);
        }
      }

      const fields = Array.from(grouped.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 20)
        .map(([name, info]) => {
          const soonestTs = Math.floor(info.soonest.getTime() / 1000);
          const shownUsers = info.users
            .slice(0, 10)
            .map((id) => `<@${id}>`)
            .join(", ");
          const more =
            info.users.length > 10 ? ` (+${info.users.length - 10} more)` : "";
          return {
            name: `${name} — ${info.count}`,
            value: `Soonest ends: <t:${soonestTs}:R>\nUsers: ${shownUsers}${more}`,
          };
        });

      return ctx.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Active Cooldowns")
            .setDescription(
              game
                ? `Showing active cooldowns for **${game}**.`
                : "Showing active cooldowns across games.",
            )
            .addFields(fields)
            .setColor(0xf1c40f),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (sub === "clear") {
      const game = ctx.options.getString("game", true).trim();
      const user = ctx.options.getUser("user");

      const filter: Record<string, any> = { COMMAND_NAME: game };
      if (user) filter.userId = user.id;

      const res = user
        ? await CooldownModel.deleteOne(filter)
        : await CooldownModel.deleteMany(filter);

      const deleted = "deletedCount" in res ? res.deletedCount : 0;

      return ctx.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Cooldowns Cleared")
            .setDescription(
              user
                ? `Cleared **${game}** cooldown for ${user}.`
                : `Cleared **${game}** cooldowns for all users.`,
            )
            .addFields({
              name: "Records removed",
              value: String(deleted),
              inline: true,
            })
            .setColor(0x2ecc71),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    return ctx.reply({ content: "Unknown subcommand.", flags: MessageFlags.Ephemeral });
  },
});
