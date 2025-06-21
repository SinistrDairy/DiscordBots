import { ApplicationCommandOptionType, MessageFlags, PermissionFlagsBits } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var land_jewels_default = commandModule({
  name: "land-adjust",
  description: `Use this command to adjust jewel counts for lands directly.`,
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "land",
      description: `What is the name of the land?`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused(true);
          const lands = await landsSchema.find({});
          const landNames = [];
          for (const results of lands) {
            landNames.push(results.name);
          }
          const filter = landNames.filter(
            (t) => t.startsWith(focus.value.toLowerCase())
          );
          await ctx.respond(
            filter.map((title) => ({ name: title, value: title }))
          );
        }
      }
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "adjustment-type",
      description: `Please select whether you would like to add or subtract jewels.`,
      choices: [
        {
          name: "add",
          value: 1
        },
        {
          name: "subtract",
          value: 2
        }
      ],
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "jewels",
      description: `How many jewels?`,
      required: true
    }
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }
    if (ctx.options.getUser("user")?.bot === true) {
      let warning = "Do not tag bots";
      ctx.reply({ flags: MessageFlags.Ephemeral, content: warning });
      return;
    }
    const land = ctx.options.getString("land", true);
    const adjustment = ctx.options.getNumber("adjustment-type", true);
    const jewels = ctx.options.getNumber("jewels", true);
    const landProfile = await landsSchema.findOne({ name: land });
    if (landProfile) {
      if (adjustment === 1) {
        await landsSchema.findOneAndUpdate(
          {
            name: land
          },
          {
            $inc: { totalPoints: jewels }
          }
        );
        const channel = ctx.client.channels.cache.get("1374744395563270205");
        channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has added ${jewels} to ${land}`);
        ctx.reply({
          content: `Gave ${jewels} jewels to ${land}.`,
          allowedMentions: { parse: ["roles", "users"] }
        });
      } else if (adjustment === 2) {
        await landsSchema.findOneAndUpdate(
          {
            name: land
          },
          {
            $inc: { totalPoints: jewels * -1 }
          }
        );
        const channel = ctx.client.channels.cache.get("1374744395563270205");
        channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has subtracted ${jewels} from ${land}`);
        ctx.reply({
          content: `Took ${jewels} jewels from ${land}.`,
          allowedMentions: { parse: ["roles", "users"] }
        });
      }
    }
  }
});
export {
  land_jewels_default as default
};
