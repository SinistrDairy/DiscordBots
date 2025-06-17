import {
  ApplicationCommandOptionType,
  GuildMember,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import userSchema from "../../models/profiles/user-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "add-profile",
  description: `Use this command to add user profiles.`,
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: `Which user?`,
      required: true,
    },
  ],

  execute: async (ctx) => {
    if (!ctx) {
      return;
    }

    const target = (await ctx.options.getMember("user")) as GuildMember;
    const roleIds = new Set([
      "830604135748337678",
      "830604878190870538",
      "830604824763695124",
      "1324823193789272146",
      "1324823285904707707",
      "1324823449197215908",
    ]);
    const roles = target.roles.cache.filter((r) => roleIds.has(r.id));
    const landName = roles.map((r) => r.name).toString();

    let profileData;
    try {
      profileData = await userSchema.findOne({ userID: target });
      if (!profileData) {
        let profile = await userSchema.create({
          userName: target.user.username,
          userID: target.user.id,
          nickName: target.displayName,
          land: landName,
          totalPoints: 0,
          events: [
            { name: "trivia", firsts: 0, seconds: 0, thirds: 0 },
            { name: "pop quiz", firsts: 0, seconds: 0, thirds: 0 },
            { name: "misc", firsts: 0, seconds: 0, thirds: 0 },
          ],
          serverID: ctx.guildId,
        });
        profile.save();
      }
    } catch (err) {
      console.log(err);
    }

    await ctx.reply("<:v_russell:1375161867152130182> done");
  },
});
