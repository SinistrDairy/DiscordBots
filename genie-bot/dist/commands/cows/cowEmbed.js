import {
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ApplicationCommandOptionType,
  MessageFlags
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
import { draftCache } from "../../utils/embedDraftCache.js";
import { convertTimeToMilliseconds } from "../../utils/strToMilli.js";
const CHANNEL_TYPES = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.AnnouncementThread
];
var cowEmbed_default = commandModule({
  type: CommandType.Slash,
  name: "create-cow",
  description: "Start building a cow embed via multi-step modals",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2]
    }),
    requirePermission("user", [PermissionFlagsBits.ManageMessages])
  ],
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "What channel is this being sent to?",
      required: true,
      channel_types: [ChannelType.GuildText]
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "description_emoji",
      description: "Upload emoji's for the description",
      required: false
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "delay",
      description: "How long until the thread auto\u2010closes (e.g. '15min', '3h', '1d')",
      required: false
    }
  ],
  async execute(ctx) {
    const channelId = ctx.options.getChannel("channel", true).id;
    const userID = ctx.user.id;
    const member = await ctx.guild?.members.fetch(userID);
    const defaultJewels = 50;
    const defaultTitle = "This is a title";
    const defaultDesc = "This is a description";
    const rawDEmoji = ctx.options.getString("description_emoji");
    const initDesc = rawDEmoji?.trim() ? rawDEmoji.trim() : defaultDesc;
    const delay = ctx.options.getString("delay") ?? "24h";
    const delayMS = convertTimeToMilliseconds(delay);
    if (delayMS === void 0) {
      return ctx.reply({
        content: "<:x_genie:1376727488822247444> Invalid delay. Use a number with `min`, `h`, or `d` (e.g. `30min`, `2h`, `1d`).",
        flags: MessageFlags.Ephemeral
      });
    }
    const embed = new EmbedBuilder().setTitle(defaultTitle).setDescription(initDesc).setFields({
      name: "\u200B",
      value: `<:fk_star_bullet_y:1377710982302011532> This quest post is worth __**${defaultJewels}**__ <:fk_jewel:1333402533439475743>`
    }).setTimestamp().setFooter({
      text: `Posted by: ${member?.displayName}`
    });
    draftCache.set(ctx.user.id, {
      flow: "cow",
      channelId,
      timestamp: true,
      embed,
      archiveDelayMs: delayMS
    });
    const modal = new ModalBuilder().setCustomId(`cowEmbedModal`).setTitle("\u{1F58B}\uFE0F Build Embed (Step 1)");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("title").setLabel("Title").setStyle(TextInputStyle.Short).setValue(defaultTitle).setMaxLength(256).setRequired(true)
      )
    );
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("description").setLabel("Description").setStyle(TextInputStyle.Paragraph).setValue(initDesc).setMaxLength(4e3).setRequired(true)
      )
    );
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("jewels").setLabel("Jewels").setStyle(TextInputStyle.Short).setValue(String(defaultJewels)).setPlaceholder("50").setRequired(true)
      )
    );
    await ctx.interaction.showModal(modal);
  }
});
const config = {
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.ManageMessages]
};
export {
  config,
  cowEmbed_default as default
};
