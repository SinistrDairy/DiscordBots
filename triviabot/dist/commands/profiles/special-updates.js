import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
const LAND_ROLE_MAP = {
  monstropolis: "1324823193789272146",
  // monsters
  "hundred acre wood": "1324823285904707707",
  // rabbits
  agrabah: "1324823449197215908",
  // sultans
  "halloween town": "830604135748337678",
  // hweens
  neverland: "830604878190870538",
  // neverland
  wonderland: "830604824763695124"
  // wonderland
};
var special_updates_default = commandModule({
  name: "special-updates",
  description: "Batch-update users moving to a new land",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageChannels]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageChannels
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "new_land",
      description: "Land name to move users into",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focused = ctx.options.getFocused();
          const lands = await landsSchema.find({}, "name").lean();
          const choices = lands.map((l) => l.name).filter(
            (name) => name.toLowerCase().startsWith(focused.toLowerCase())
          ).slice(0, 25).map((name) => ({ name, value: name }));
          await ctx.respond(choices);
        }
      }
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: "mention_role",
      description: "Optional: role to mention when announcing",
      required: false
    }
  ],
  execute: async (ctx) => {
    const landInput = ctx.options.getString("new_land", true).toLowerCase();
    const mentionRole = ctx.options.getRole("mention_role");
    const landDoc = await landsSchema.findOne({
      name: new RegExp(`^${landInput}$`, "i")
    });
    if (!landDoc || !(landInput in LAND_ROLE_MAP)) {
      return ctx.reply({
        content: `\u274C Land "${landInput}" is not recognized.`,
        flags: MessageFlags.Ephemeral
      });
    }
    const roleId = LAND_ROLE_MAP[landInput];
    await ctx.guild.members.fetch();
    const members = ctx.guild.roles.cache.get(roleId)?.members;
    if (!members || members.size === 0) {
      return ctx.reply({
        content: `\u2139\uFE0F No users found in land "${landInput}" to update.`,
        flags: MessageFlags.Ephemeral
      });
    }
    const ids = Array.from(members.keys());
    const res = await profileSchema.updateMany(
      { userID: { $in: ids } },
      { $set: { land: landInput } }
    );
    const logId = "1374744395563270205";
    if (logId) {
      const ch = ctx.client.channels.cache.get(logId);
      const changer = await ctx.guild.members.fetch(ctx.user.id);
      const mention = mentionRole ? `<@&${mentionRole.id}> ` : "";
      await ch.send(
        `${mention}<:v_russell:1375161867152130182> ${changer.displayName} moved **${res.modifiedCount}** users to **${landDoc.name}**.`
      );
    }
    await ctx.reply({
      content: `\u2705 Updated **${res.modifiedCount}** profiles to land **${landDoc.name}**.`,
      flags: MessageFlags.Ephemeral
    });
  }
});
export {
  special_updates_default as default
};
