import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  NewsChannel,
  TextChannel,
  ThreadChannel
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
import { eventDrafts } from "../../utils/eventDraftCache.js";
import { buildEventPreview } from "../../utils/buildEventPreview.js";
var new_add_event_default = commandModule({
  name: "event-management",
  description: "\u{1F6E0} Multi-step event wizard",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "title_emoji",
      description: "Emoji to prefix your event title (e.g. \u2728)",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "rules_emoji",
      description: "Bullet emoji for each rule (e.g. \u{1F43E})",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "jewel_emoji",
      description: "Jewel emoji for scoring (e.g. \u{1F48E})",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "event_emoji",
      description: `Event emoji for scheduling (e.g. <:fk_trivia:1267638143079944347>)`,
      required: true
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: "tags",
      description: "Tag the appropriate role (limit one)",
      required: true
    }
  ],
  async execute(ctx) {
    const titleEmoji = ctx.options.getString("title_emoji", true);
    const rulesEmoji = ctx.options.getString("rules_emoji", true);
    const jewelEmoji = ctx.options.getString("jewel_emoji", true);
    const eventEmoji = ctx.options.getString("event_emoji", true);
    const role = ctx.options.getRole("tags", true);
    const tag = role.toString();
    const draft = {
      titleEmoji,
      rulesEmoji,
      jewelEmoji,
      eventEmoji,
      tags: tag,
      serverID: ctx.guildId
    };
    const modal = new ModalBuilder().setCustomId("eventModal").setTitle("Create Custom Event");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("name").setLabel("Name").setStyle(TextInputStyle.Short).setPlaceholder(`Enter name of event...`).setRequired(true)
      )
    );
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("title").setLabel("Title").setStyle(TextInputStyle.Short).setPlaceholder("Enter title of event...").setMaxLength(256).setRequired(true)
      )
    );
    eventDrafts.set(ctx.user.id, draft);
    const preview = await buildEventPreview(ctx, draft);
    if (ctx.channel && (ctx.channel instanceof TextChannel || ctx.channel instanceof NewsChannel || ctx.channel instanceof ThreadChannel)) {
      const sent = await ctx.channel.send({ ...preview });
      eventDrafts.set(ctx.user.id, { ...draft, previewMessageId: sent.id });
    }
    await ctx.interaction.showModal(modal);
  }
});
export {
  new_add_event_default as default
};
