import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type ColorResolvable,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import specialEventSchema from "../../models/profiles/special-event-schema.js";
import { publishConfig } from "@sern/publisher";
import { suggestSpecialEvents } from "../../utils/suggestSpecialEvents.js";

export default commandModule({
  name: "start-specialevent",
  description: "Post a formatted embed to start a special event!",
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
      name: "event",
      description: "Select the special event",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: suggestSpecialEvents,
      },
    },
  ],

  execute: async (ctx) => {
    const name = ctx.options.getString("event", true);

    const event = await specialEventSchema.findOne({ name }).lean();
    if (!event) {
      return ctx.reply({
        content: "❌ That event could not be found.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const {
      title,
      color,
      howToPlay,
      daRulez,
      scoring,
      pointList,
      eEmojiID,
      rEmojiID,
      mImage,
      fImage,
      hEmojiID,
      tags,
    } = event;

    const jewelEmoji = `<:fk_jewel:1333402533439475743>`;
    const dotEmoji   = "<:fk_dot:1334970932657131560>";
    const skipPhrase = "as follows:";

    const formatBlock = (lines: string[], emoji: string) =>
      lines.map((l) => `${emoji} ${l}`).join("\n");

    const howToBlock = formatBlock(howToPlay, hEmojiID);
    const rulesBlock = formatBlock(daRulez, rEmojiID);

    let scoreBlock = "";
    for (let i = 0, ptI = 0; i < scoring.length; ++i) {
      const desc = scoring[i].trim();
      if (desc.endsWith(skipPhrase)) {
        scoreBlock += `${desc}\n`;
        continue;
      }
      const points = pointList[ptI++]?.trim() ?? "0";
      scoreBlock += `${dotEmoji} ${desc} — **${points}** ${jewelEmoji}\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${eEmojiID} ${title.toUpperCase()}`)
      .setDescription(
        `*Refreshed and ready for fun!*\n\n` +
          `**How to play:**\n${howToBlock}\n\n` +
          `**Rules:**\n${rulesBlock}\n\n` +
          `**Scores:**\n${scoreBlock}`
      )
      .setColor(color as ColorResolvable)
      .setImage(fImage!);

    await ctx.reply({
      content: `${tags}\n${mImage}`,
      embeds: [embed],
      allowedMentions: { parse: ["users", "roles"] },
    });
  },
});
