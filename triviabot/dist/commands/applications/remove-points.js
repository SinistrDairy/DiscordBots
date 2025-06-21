import { ApplicationCommandOptionType, MessageFlags, PermissionFlagsBits } from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import userSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var remove_points_default = commandModule({
  name: "jewel-adjust",
  description: `Use this command to adjust jewel counts.`,
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
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: `What is the name of the user you'd wish to take jewels from?`,
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "event",
      description: `Which event are you adjusting for?`,
      choices: [
        { name: "trivia", value: "trivia" },
        { name: "pop quiz", value: "pop quiz" },
        { name: "misc", value: "misc" }
      ],
      required: true
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
    const user = ctx.options.getUser("user", true);
    const jewels = ctx.options.getNumber("jewels", true);
    const event = ctx.options.getString("event", true).toLowerCase();
    const adjustment = ctx.options.getNumber("adjustment-type", true);
    const userProfile = await userSchema.findOne({ userID: user.id });
    if (userProfile) {
      const landName = userProfile.land.split(" ").map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(" ");
      if (adjustment === 1) {
        await landsSchema.findOneAndUpdate(
          {
            name: landName
          },
          {
            $inc: { totalPoints: jewels }
          }
        );
        await userSchema.findOneAndUpdate(
          {
            userID: user.id
          },
          {
            $inc: { totalPoints: jewels }
          }
        );
        await userSchema.collection.updateOne(
          { userID: user.id },
          {
            $inc: { "events.$[e].firsts": jewels }
          },
          {
            arrayFilters: [{ "e.name": event }]
          }
        );
        const channel = ctx.client.channels.cache.get("1374744395563270205");
        channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has added ${jewels} to ${landName}`);
        ctx.reply({
          content: `Gave ${jewels} jewels to ${user} for ${event}.`,
          allowedMentions: { parse: ["roles", "users"] }
        });
      } else if (adjustment === 2) {
        await landsSchema.findOneAndUpdate(
          {
            name: landName
          },
          {
            $inc: { totalPoints: jewels * -1 }
          }
        );
        await userSchema.findOneAndUpdate(
          {
            userID: user.id
          },
          {
            $inc: { totalPoints: jewels * -1 }
          }
        );
        await userSchema.collection.updateOne(
          { userID: user.id },
          { $inc: { "events.$[e].firsts": jewels * -1 } },
          {
            arrayFilters: [{ "e.name": event }]
          }
        );
        const channel = ctx.client.channels.cache.get("1374744395563270205");
        channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has subtracted ${jewels} from ${landName}`);
        ctx.reply({
          content: `<:v_russell:1375161867152130182> Took ${jewels} jewels from ${user} for ${event}.`,
          allowedMentions: { parse: ["roles", "users"] }
        });
      }
    }
  }
});
export {
  remove_points_default as default
};
