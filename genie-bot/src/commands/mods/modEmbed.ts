import {
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ApplicationCommandOptionType,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
import { draftCache } from "../../utils/embedDraftCache.js";
import embedCancel from "../embedCancel.js";

const CHANNEL_TYPES = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.AnnouncementThread,
];

export default commandModule({
  type: CommandType.Slash,
  name: "embed-create",
  description: "Start building an embed via multi-step modals",
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!] as [
        `${number}`,
        `${number}`
      ],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    }),
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "What channel is this being sent to?",
      required: true,
      channel_types: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
      ],
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "mention_user",
      description: "Which user would you like to mention?",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: "mention_role",
      description: "Which role would you like to mention?",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Channel,
      name: "mention_channel",
      description: "Which channel would you like to mention?",
      required: false,
      channel_types: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
      ],
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "title_emoji",
      description: "Upload emoji's for the title",
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "description_emoji",
      description: "Upload emoji's for the description",
      required: false,
    },
  ],

  async execute(ctx) {
    const channelId = ctx.options.getChannel("channel", true).id;
    const userMention = ctx.options.getUser("mention_user")?.id;
    const roleMention = ctx.options.getRole("mention_role")?.id;
    const chanMention = ctx.options.getChannel("mention_channel")?.id;
    const defaultTitle = "This is a title";
    const defaultDesc = "This is a description";
    const rawTEmoji = ctx.options.getString("title_emoji");
    const rawDEmoji = ctx.options.getString("description_emoji");
    const initTitle = rawTEmoji?.trim() ? rawTEmoji.trim() : defaultTitle;
    const initDesc = rawDEmoji?.trim() ? rawDEmoji.trim() : defaultDesc;

    // build the mention string
    let mention: string | undefined;
    if (userMention) mention = `<@${userMention}>`;
    else if (roleMention) mention = `<@&${roleMention}>`;
    else if (chanMention) mention = `<#${chanMention}>`;

    const embed = new EmbedBuilder()
      .setTitle(initTitle)
      .setDescription(initDesc);

    // stash into your draft cache
    draftCache.set(ctx.user.id, {
      flow: "mod",
      channelId,
      mention,
      timestamp: true,
      embed,
    });

    const modal = new ModalBuilder()
      .setCustomId(`modEmbedModal`)
      .setTitle("🖋️ Build Embed (Step 1)");

    // Title
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Title")
          .setStyle(TextInputStyle.Short)
          .setValue(initTitle)
          .setMaxLength(256)
          .setRequired(true)
      )
    );
    // Description
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Description")
          .setStyle(TextInputStyle.Paragraph)
          .setValue(initDesc)
          .setMaxLength(4000)
          .setRequired(true)
      )
    );

    await ctx.interaction.showModal(modal);
  },
});
