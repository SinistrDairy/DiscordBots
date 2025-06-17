import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  TextChannel,
  MessageFlags,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "end-task",
  description: "End the task and allocate jewels to the three lands.",
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
      type: ApplicationCommandOptionType.String,
      name: "task",
      description: "What task are you ending?",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "agrabah",
      description: "Jewels for Agrabah",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "hundred_acre_wood",
      description: "Jewels for Hundred Acre Wood",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "monstropolis",
      description: "Jewels for Monstropolis",
      required: true,
    },
  ],

  execute: async (ctx) => {
    try {
      // 1) Gather inputs
      const eventName = ctx.options.getString("task", true).toUpperCase();
      const inputs = [
        { name: "Agrabah", jewels: ctx.options.getNumber("agrabah", true) },
        {
          name: "Hundred Acre Wood",
          jewels: ctx.options.getNumber("hundred_acre_wood", true),
        },
        {
          name: "Monstropolis",
          jewels: ctx.options.getNumber("monstropolis", true),
        },
      ];

      // 2) Update each land's points in parallel
      await Promise.all(
        inputs.map(({ name, jewels }) =>
          landsSchema.findOneAndUpdate(
            { name },
            { $inc: { totalPoints: jewels } }
          )
        )
      );

      // 3) Fetch emoji IDs and sort by jewels descending
      const detailed = await Promise.all(
        inputs.map(async ({ name, jewels }) => {
          const land = await landsSchema.findOne({ name });
          return {
            name,
            jewels,
            emojiID: land?.emojiID ?? "",
          };
        })
      );
      detailed.sort((a, b) => b.jewels - a.jewels);

      // 4) Build the land-order string and log each update
      let landOrder = "";
      const actor =
        (await ctx.guild!.members.fetch(ctx.user.id)).nickname ??
        ctx.user.username;
      const logChannel = ctx.client.channels.cache.get(
        "1374744395563270205"
      ) as TextChannel;

      for (const { name, jewels, emojiID } of detailed) {
        landOrder += `${name}: **${jewels}** ${emojiID}\n`;
        await logChannel.send(
          `<:v_russell:1375161867152130182> ${actor} has added ${jewels} jewels to ${name}`
        );
      }

      // 5) Compose the announcement string
      const endAnnounce = `## <a:fk_sparkles:1073627951989534800> **${eventName} TOTALS** <a:fk_sparkles:1073627951989534800>
${landOrder}
-# Check out <#830617045741731910> for our weekly scheduled events to earn your land more jewels. We hope to see you there!`;

      // 6) Send “ended” notifications
      const endChannel1 = ctx.client.channels.cache.get(
        "1374744395563270205"
      ) as TextChannel;
      await endChannel1.send(
        `<:v_russell:1375161867152130182> ${actor} has ended ${eventName}`
      );

      const endChannel2 = ctx.client.channels.cache.get(
        "1220081937906008144"
      ) as TextChannel;
      await endChannel2.send(
        `<:v_russell:1375161867152130182> ${actor} has ended ${eventName}`
      );

      // 7) Reply with the formatted totals
      await ctx.reply({
        content: endAnnounce,
        allowedMentions: { parse: ["roles", "users"] },
      });
    } catch (err) {
      console.error("[end-task] error:", err);
      return ctx.reply({
        content: "⚠️ Something went wrong ending your task.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
