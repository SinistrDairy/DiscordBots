import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import landSchema from "../../models/trivia/lands-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
var add_land_default = commandModule({
  name: "add-lands",
  description: `Use this command to add a land.`,
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
      name: "land",
      description: `Which land?`,
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "emoji",
      description: "emoji ID associated with land",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "special",
      description: "Is this a special land related to a unique event?",
      required: true
    }
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }
    const target = ctx.options.getString("land");
    const tEmoji = ctx.options.getString("emoji");
    const tSpecial = ctx.options.getBoolean("special");
    const roles = ctx.guild.roles.cache.find((role) => role.name === target);
    const roleID = roles.id;
    let landData;
    try {
      landData = await landSchema.findOne({ name: target });
      if (!landData) {
        let profile = await landSchema.create({
          name: target,
          roleID,
          emojiID: tEmoji,
          totalPoints: 0,
          triviaPoints: 0,
          special: tSpecial,
          serverID: ctx.guildId
        });
        profile.save();
      }
    } catch (err) {
      console.log(err);
    }
    await ctx.reply(`<:v_russell:1375161867152130182> added ${target}`);
  }
});
export {
  add_land_default as default
};
