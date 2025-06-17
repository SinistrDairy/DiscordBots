const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("post")
    .setDescription("Allows the user to post their activity")
    .addStringOption((option1) =>
      option1
        .setName("title")
        .setDescription("the title of your post")
        .setRequired(true)
    )
    .addStringOption((option2) =>
      option2
        .setName("description")
        .setDescription("the description of your post")
        .setRequired(true)
    )
    .addStringOption((option3) =>
      option3
        .setName("url")
        .setDescription("the post url if there is one")
        .setRequired(false)
    )
    .addStringOption((option4) =>
      option4
        .setName("image")
        .setDescription("the image url if there is one")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction, client) {
    const title = interaction.options.getString("title");
    const desc = interaction.options.getString("description");
    const url = interaction.options.getString("url");
    const img = interaction.options.getString("image");
    let descText = desc;
    descText += `\n\n`;
    if(url){
      descText += url;
    }
    const embed = new EmbedBuilder()
      .setTitle(`${title}`)
      .setDescription(`${descText}`)
      .setColor(0x4188c5)
      .setImage(img)
      .setFooter({ text: `Posted by: ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
};
