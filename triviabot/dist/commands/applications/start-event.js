import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { publishConfig } from "@sern/publisher";
import { suggestEvents } from "../../utils/suggestEvents.js";
var start_event_default = commandModule({
  name: "start-event",
  description: "Use this command to start your event!",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
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
        execute: suggestEvents
      }
    }
  ],
  execute: async (ctx) => {
    const name = ctx.options.getString("event", true);
    const hostID = ctx.user.id;
    const event = await eventSchema.findOne({ name });
    if (!event)
      return "This event does not exist";
    let { daRulez, tags, title, scoring, eEmojiID, rEmojiID, pointList } = event;
    tags = tags.replace(/,/g, " ");
    const rulesEmoji = rEmojiID;
    const dotEmoji = "<:fk_dot:1334970932657131560>";
    const jewelEmoji = "<:fk_jewel:1333402533439475743>";
    const skipPhrase = "as follows:";
    function stripMarkdown(w) {
      return w.replace(/^[_*~`]+|[_*~`]+$/g, "");
    }
    function shouldSkipLine(raw) {
      const txt = raw.trim();
      if (txt.toLowerCase().endsWith(skipPhrase))
        return true;
      if (txt.endsWith(jewelEmoji))
        return true;
      const tokens = txt.split(/\s+/);
      const lastToken = stripMarkdown(tokens[tokens.length - 1] || "");
      return /^(\d+)(?:\/\d+)*$/.test(lastToken);
    }
    const rulesLines = daRulez.map((rule) => `${rulesEmoji} ${rule.trim()}`).join("\n");
    const scoreLines = [];
    let pIdx = 0;
    (scoring ?? []).forEach((raw) => {
      const txt = raw.trim();
      if (shouldSkipLine(txt)) {
        scoreLines.push(`${dotEmoji} ${txt}`);
      } else if (pIdx < (pointList ?? []).length) {
        const pts = (pointList[pIdx++] ?? "0").trim();
        scoreLines.push(`${dotEmoji} ${txt} __**${pts}**__ ${jewelEmoji}`);
      } else {
        scoreLines.push(`${dotEmoji} ${txt}`);
      }
    });
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
      tags
    ].join("\n");
    return ctx.reply({
      content,
      allowedMentions: { parse: ["roles", "users"] }
    });
  }
});
export {
  start_event_default as default
};
