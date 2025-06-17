import {
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  TextChannel,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import landsSchema from "../../models/trivia/lands-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

const EMBED_COLOR = "LuminousVividPink";
const EMBED_TITLE = "Total Jewels";
const FOOTER = {
  text: "Land information brought to you by: Russell, Junior Wilderness Explorer",
  iconURL: "https://i.imgur.com/351T42x.png",
};
const MAX_LANDS = 4;
const MIN_LANDS = 1;
const DEFAULT_LANDS = 3;

export default commandModule({
  name: "land-totals",
  description: "View total points for each land",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    }),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "special",
      description: "Is this a special event month?",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "land-count",
      description: `How many lands would you like to view? (1–4; default 3 if omitted)`,
      required: false,
    },
  ],

  execute: async (ctx) => {
    // 1) Grab inputs
    const special = ctx.options.getBoolean("special", true);
    // getNumber(..., false) may return undefined → use DEFAULT_LANDS when undefined
    const rawCount = ctx.options.getNumber("land-count", false) ?? DEFAULT_LANDS;

    // 2) Determine final count:
    //    • If special === false → always 3.
    //    • If special === true → clamp rawCount between 1 and 4.
    const landCount = special
      ? Math.min(MAX_LANDS, Math.max(MIN_LANDS, rawCount))
      : DEFAULT_LANDS;

    // 3) Fetch exactly `landCount` documents matching { special }
    const profiles = await landsSchema
      .find({ special })
      .sort({ totalPoints: -1 })
      .limit(landCount);

    // 4) Guard: if no matching lands, reply ephemeral and stop
    if (!profiles.length) {
      return ctx.reply({
        content: `❌ No lands found for ${
          special ? "special" : "non-special"
        } filter.`,
        flags: 1 << 6, // ephemeral
      });
    }

    // 5) Build each line from the fetched documents
    const lines = profiles.map((landDoc) => {
      return (
        `${landDoc.emojiID} **${landDoc.name}** ${landDoc.emojiID}\n` +
        `**Total Jewels**: ${landDoc.totalPoints}`
      );
    });
    const description = lines.join("\n\n");

    // 6) Create a single embed
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(EMBED_TITLE)
      .setDescription(description)
      .setFooter(FOOTER);

    // 7) Send the response
    return ctx.reply({ embeds: [embed] });
  },
});

