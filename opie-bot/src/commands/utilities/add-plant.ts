import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  Role,
} from "discord.js";
import plantSchema from "../../models/core/plant-Schema.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "add-plants",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  description: "Use this command to add more plants to the garden.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "new-plant",
      description: "plants name",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "plant-image",
      description: "plants image",
      required: true,
    },
  ],
  execute: async (ctx) => {
    const target = ctx.member as GuildMember;
    const roleIDs = new Set(["1367191933335765032", "1364313155668410562"]);

    const roleCheck = target.roles.cache.filter((role: Role) =>
      roleIDs.has(role.id)
    );
    const hasRoles = roleCheck.size > 0;

    console.log(hasRoles);

    if (hasRoles === false) {
      const noRole = new EmbedBuilder()
        .setTitle("__No Subscription Found__")
        .setColor("Red")
        .setDescription(
          `We're sorry, but to use this command you must be an active subscriber.`
        );

      await ctx.reply({ embeds: [noRole] });
      return;
    }

    const pName = ctx.options.getString("new-plant");
    const pImage = ctx.options.getString("plant-image");
    let plantData;

    try {
      plantData = await plantSchema.findOne({ plantName: pName });

      if (!plantData) {
        let pProfile = await plantSchema.create({
          plantName: pName,
          plantImage: pImage,
        });

        pProfile.save();
      } else {
        await ctx.reply(`Already have ${pName}`);
        return;
      }
    } catch (err) {
      console.log(err);
    }
    await ctx.reply(`added ${pName}`);
  },
});
