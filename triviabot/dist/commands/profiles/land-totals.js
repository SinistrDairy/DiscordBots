import {
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import landsSchema from "../../models/trivia/lands-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
const EMBED_COLOR = "LuminousVividPink";
const EMBED_TITLE = "Total Jewels";
const FOOTER = {
  text: "Land information brought to you by: Russell, Junior Wilderness Explorer",
  iconURL: "https://i.imgur.com/351T42x.png"
};
const MAX_LANDS = 4;
const MIN_LANDS = 1;
const DEFAULT_LANDS = 3;
var land_totals_default = commandModule({
  name: "land-totals",
  description: "View total points for each land",
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
      type: ApplicationCommandOptionType.Boolean,
      name: "special",
      description: "Is this a special event month?",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "land-count",
      description: `How many lands would you like to view? (1\u20134; default 3 if omitted)`,
      required: false
    }
  ],
  execute: async (ctx) => {
    const special = ctx.options.getBoolean("special", true);
    const rawCount = ctx.options.getNumber("land-count", false) ?? DEFAULT_LANDS;
    const landCount = special ? Math.min(MAX_LANDS, Math.max(MIN_LANDS, rawCount)) : DEFAULT_LANDS;
    const profiles = await landsSchema.find({ special }).sort({ totalPoints: -1 }).limit(landCount);
    if (!profiles.length) {
      return ctx.reply({
        content: `\u274C No lands found for ${special ? "special" : "non-special"} filter.`,
        flags: 1 << 6
        // ephemeral
      });
    }
    const lines = profiles.map((landDoc) => {
      return `${landDoc.emojiID} **${landDoc.name}** ${landDoc.emojiID}
**Total Jewels**: ${landDoc.totalPoints}`;
    });
    const description = lines.join("\n\n");
    const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(EMBED_TITLE).setDescription(description).setFooter(FOOTER);
    return ctx.reply({ embeds: [embed] });
  }
});
export {
  land_totals_default as default
};
