import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import landsSchema from "../../models/trivia/lands-schema.js";
import userSchema from "../../models/profiles/user-schema.js"; // adjust if your file is named/users-schema.ts
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "stretch",
  description: "Record stretches and award jewels to lands",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    }),
  ],
  options: [
    {
      name: "member1",
      description: "First member.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "jewels",
      description: "Number of jewels earned",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: "word",
      description: "Word formed by stretches",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "member2",
      description: "Second member (optional)",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],

  execute: async (ctx) => {
    // gather options
    const member = await ctx.guild?.members.fetch(ctx.user.id);
    const user1 = ctx.options.getUser("member1", true);
    const user2 = ctx.options.getUser("member2", false);
    const jewels = ctx.options.getNumber("jewels", true);
    const word = ctx.options.getString("word", true).toUpperCase();

    if (!member) {
      return await ctx.reply({
        content:
          "<:r_x:1376727384056922132> member information not located in guild.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // ❌ Bot check
    if (user1.bot || (user2 && user2.bot)) {
      return ctx.reply({
        content:
          "<:r_x:1376727384056922132> You cannot tag bots for stretching.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const players = user2 ? [user1, user2] : [user1];
    const mentions = players.map((u) => `<@${u.id}>`).join(" & ");
    const fullNames = players
      .map((u) => {
        const member = ctx.guild?.members.cache.get(u.id);
        return member?.nickname || u.username;
      })
      .join(" & ");

    // 1) announce in gym channel
    const gym = ctx.client.channels.cache.get(
      "862329765801623582"
    ) as TextChannel;
    if (!gym)
      return ctx.reply({
        content: "Gym channel not found.",
        flags: MessageFlags.Ephemeral,
      });
    await gym.send(
      `**${mentions}** completed their stretches making the word **${word}**!`
    );

    // 2) add jewels
    for (const u of players) {
      const profile = await userSchema.findOne({ userID: u.id });
      if (!profile) {
        await ctx.reply({
          content: `Could not find profile for <@${u.id}>.`,
          flags: MessageFlags.Ephemeral,
        });
        continue;
      }
      const landName = profile.land
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      console.log(landName);
      await landsSchema.findOneAndUpdate(
        { name: landName },
        { $inc: { totalPoints: jewels } }
      );
    }

    const logChannel = ctx.client.channels.cache.get(
      "1374744395563270205"
    ) as TextChannel;
    logChannel.send(
      `<:v_russell:1375161867152130182> ${member.displayName} has given jewels for stretching`
    );

    // 3) confirm to invoker
    return ctx.reply({
      content: `<:r_check:1376727299864662106> Added **${jewels}** jewels to the associated land${
        players.length > 1 ? "s" : ""
      } for **${fullNames}**.`,
      flags: MessageFlags.Ephemeral,
    });
  },
});
