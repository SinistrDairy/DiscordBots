import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { publishConfig } from "@sern/publisher";
import { suggestEvents } from "../../utils/suggestEvents.js";

export default commandModule({
  name: "start-event",
  description: "Use this command to start your event!",
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
      description: `Select which event you're going to run`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: suggestEvents,
      },
    },
  ],

  execute: async (ctx) => {
    const name = ctx.options.getString("event", true);
    const hostID = ctx.user.id;
    const event = await eventSchema.findOne({ name });
    if (!event) return "This event does not exist";

    // unpack
    let { daRulez, tags, title, scoring, eEmojiID, rEmojiID, pointList } =
      event;
    tags = tags.replace(/,/g, " ");
    const rulesEmoji = rEmojiID;
    const dotEmoji = "<:fk_dot:1334970932657131560>";
    const jewelEmoji = "<:fk_jewel:1333402533439475743>";
    const skipPhrase = "as follows:";

    // helper to strip markdown wrappers
    function stripMarkdown(w: string) {
      return w.replace(/^[_*~`]+|[_*~`]+$/g, "");
    }

    // return true if we should NOT attach a point value
    function shouldSkipLine(raw: string): boolean {
      const txt = raw.trim();
      // 1) literal skip-phrase
      if (txt.toLowerCase().endsWith(skipPhrase)) return true;
      // 2) ends with the raw jewel emoji
      if (txt.endsWith(jewelEmoji)) return true;
      // 3) last “word” is a number or ratio (e.g. 75/25)
      const tokens = txt.split(/\s+/);
      const lastToken = stripMarkdown(tokens[tokens.length - 1] || "");
      return /^(\d+)(?:\/\d+)*$/.test(lastToken);
    }

    // build the rules block
    const rulesLines = daRulez
      .map((rule) => `${rulesEmoji} ${rule.trim()}`)
      .join("\n");

    // build the scoring block
    const scoreLines: string[] = [];
    let pIdx = 0;
    (scoring ?? []).forEach((raw) => {
      const txt = raw.trim();
      if (shouldSkipLine(txt)) {
        // skip attaching a point, but still bullet it
        scoreLines.push(`${dotEmoji} ${txt}`);
      } else if (pIdx < (pointList ?? []).length) {
        const pts = (pointList![pIdx++] ?? "0").trim();
        scoreLines.push(`${dotEmoji} ${txt} __**${pts}**__ ${jewelEmoji}`);
      } else {
        // fallback if points run out
        scoreLines.push(`${dotEmoji} ${txt}`);
      }
    });

    // assemble full message
    const content = [
      `## ${eEmojiID} ${title} ${eEmojiID}`,
      "",
      `__**Rules**__`,
      rulesLines,
      "",
      `__**Scoring**__`,
      scoreLines.join("\n"),
      "",
      `<a:magicjewels:859867893587509298> Your host for today's game is: <@${hostID}>!`,
      "",
      tags,
    ].join("\n");

    return ctx.reply({
      content,
      allowedMentions: { parse: ["roles", "users"] },
    });
  },
});
