import {
  ApplicationCommandOptionType,
  GuildMember,
  PermissionFlagsBits,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "clear-lands",
  description: `Use this command to clear stats in land profiles`,
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    }),
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }

    const results = await landSchema.find({});

    for (const result of results) {
      const roleIDs = result.roleID;
      await landSchema.findOneAndUpdate(
        {
          roleID: roleIDs,
        },
        {
          $set: { triviaPoints: 0, totalPoints: 0 },
        }
      );
    }
    const channel = ctx.client.channels.cache.get('1374744395563270205') as TextChannel
    channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild!.members.fetch(ctx.user.id)).nickname} has cleared lands`)

    ctx.reply(`<:v_russell:1375161867152130182> All lands have been cleared!`);
    
  },
});
