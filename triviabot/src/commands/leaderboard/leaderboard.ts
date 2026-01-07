import {
  PermissionFlagsBits,
  PermissionsBitField,
  orderedList,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import userSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "leaderboard",
  description: "Use this command to check the leaderboard!",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    }),
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }

    await ctx.interaction.deferReply();

    //#region const vars
    const list: {userID: string; totals: number; landEmoji: string}[] = [];

    const users = await userSchema.find({}).lean();

    for (const u of users as any[]) {
      const { userID, land } = u;

      // reset per user
      let triviaTotal = 0;
      let popQuizTotal = 0;

      const events = Array.isArray(u.events) ? u.events : [];
      for (const event of events) {
        if (!event || typeof event !== "object") continue;

        const name = event.name;
        const firsts = Number(event.firsts ?? 0);
        const seconds = Number(event.seconds ?? 0);
        const thirds = Number(event.thirds ?? 0);

        const total = firsts + seconds + thirds;

        if (name === "trivia") triviaTotal = total;
        if (name === "pop quiz") popQuizTotal = total;
      }

      const totals = triviaTotal + popQuizTotal;

      // land -> Title Case to match lands.name
      const landName =
        typeof land === "string"
          ? land
              .split(" ")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "";

      const lProfile = await landsSchema.findOne({ name: landName }).lean();
      const landEmoji = (lProfile as any)?.emojiID ?? "";

      list.push({ userID, totals, landEmoji });
    }

    const sortedList = list.sort((a, b) => b.totals - a.totals).slice(0, 20);

    const triviaOrder = sortedList
      .map(
        (x, i) => `${i + 1}.) <@${x.userID}> with **${x.totals}** ${x.landEmoji}`
      )
      .join("\n");

    const leaderboard = `### __LEADERBOARD__\n${triviaOrder}\n`;

    await ctx.interaction.editReply({
      content: leaderboard,
      allowedMentions: { parse: ["roles", "users"] },
    });

  },
});