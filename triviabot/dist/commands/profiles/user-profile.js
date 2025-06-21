import { EmbedBuilder, MessageFlags } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var user_profile_default = commandModule({
  name: "profile",
  description: "View your profile",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2]
    })
  ],
  execute: async (ctx) => {
    const profile = await profileSchema.findOne({
      userID: ctx.user.id
    });
    if (profile) {
      const pName = profile.userName;
      const member = await ctx.guild?.members.fetch(ctx.user.id);
      const nName = member?.nickname;
      const landName = profile.land.split(" ").map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(" ");
      let tJewels = 0;
      let pJewels = 0;
      let totals = 0;
      let miscJewels = 0;
      let miscTotals = 0;
      let landEmoji;
      const pIcon = ctx.user.displayAvatarURL();
      for (const event of profile.events) {
        const { name, firsts = 0, seconds = 0, thirds = 0 } = event;
        if (name === "trivia") {
          tJewels = firsts + seconds + thirds;
        } else if (name === "pop quiz") {
          pJewels = firsts + seconds + thirds;
        } else {
          miscJewels += firsts + seconds + thirds;
        }
        totals = tJewels + pJewels;
        miscTotals = miscJewels;
      }
      const lProfile = await landsSchema.findOne({ name: landName });
      landEmoji = lProfile.emojiID;
      const viewP = new EmbedBuilder().setColor("Random").setTitle(`${nName}'s Profile`).setAuthor({
        name: `${pName}`,
        iconURL: pIcon
      }).setThumbnail(pIcon).addFields(
        {
          name: `**__Land:__**`,
          value: `${landName}`
        },
        {
          name: `**__Earned Trivia Jewels:__** `,
          value: `${totals}`
        },
        {
          name: `**__Miscellaneous Jewels:__** `,
          value: `${miscTotals}`
        }
      ).setFooter({
        text: "Profile information brought to you by:\nRussell, Junior Wilderness Explorer",
        iconURL: "https://i.imgur.com/351T42x.png"
      }).setTimestamp();
      await ctx.reply({ embeds: [viewP], flags: MessageFlags.Ephemeral });
    }
  }
});
export {
  user_profile_default as default
};
