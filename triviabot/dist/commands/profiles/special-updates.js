import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import profileSchema from "../../models/profiles/user-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var special_updates_default = commandModule({
  name: "special-updates",
  description: "Special updates for land changes.",
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
      name: "new-land",
      description: `What is the name of the land they're going to?`,
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
      type: ApplicationCommandOptionType.String,
      name: "role",
      description: `What is the mention role for the new land?`,
      required: false
    }
  ],
  execute: async (ctx) => {
    const role = ctx.options.getString("role");
    const newLand = ctx.options.getString("new-land", true).toLowerCase();
    await ctx.guild.members.fetch();
    const monsters = ctx.guild?.roles.cache.get("1324823193789272146")?.members.map((m) => m.user.id);
    const rabbits = ctx.guild?.roles.cache.get("1324823285904707707")?.members.map((m) => m.user.id);
    const sultans = ctx.guild?.roles.cache.get("1324823449197215908")?.members.map((m) => m.user.id);
    const hweens = ctx.guild?.roles.cache.get("830604135748337678")?.members.map((m) => m.user.id);
    const neverland = ctx.guild?.roles.cache.get("830604878190870538")?.members.map((m) => m.user.id);
    const wonderland = ctx.guild?.roles.cache.get("830604824763695124")?.members.map((m) => m.user.id);
    if (newLand == "monstropolis") {
      for (const results of monsters) {
        const userID = results;
        console.log(`userIDs: ${userID}`);
        const profile = await profileSchema.find({ userID });
        if (profile) {
          await profileSchema.updateOne(
            { userID },
            {
              $set: { land: newLand }
            },
            {}
          );
        }
      }
      const channel = ctx.client.channels.cache.get("1374744395563270205");
      channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has sent multiple users to Monstropolis!`);
      await ctx.reply(`Success! You've made some new ${role}!!`);
    }
    if (newLand == "hundred acre wood") {
      for (const results of rabbits) {
        const userID = results;
        console.log(`userIDs: ${userID}`);
        const profile = await profileSchema.find({ userID });
        if (profile) {
          await profileSchema.updateOne(
            { userID },
            {
              $set: { land: newLand }
            },
            {}
          );
        }
      }
      const channel = ctx.client.channels.cache.get("1374744395563270205");
      channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has sent multiple users to the Hundred Acre Wood!`);
      await ctx.reply(`<:v_russell:1375161867152130182> Success! You've made some new ${role}!!`);
    }
    if (newLand == "agrabah") {
      for (const results of sultans) {
        const userID = results;
        console.log(`userIDs: ${userID}`);
        const profile = await profileSchema.find({ userID });
        if (profile) {
          await profileSchema.updateOne(
            { userID },
            {
              $set: { land: newLand }
            },
            {}
          );
        }
      }
      const channel = ctx.client.channels.cache.get("1374744395563270205");
      channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has sent multiple users to Agrabah!`);
      await ctx.reply(`<:v_russell:1375161867152130182> Success! You've made some new ${role}!!`);
    }
    if (newLand == "halloween town") {
      for (const results of hweens) {
        const userID = results;
        console.log(`UserIDs: ${userID}`);
        const profile = await profileSchema.find({ userID });
        if (profile) {
          await profileSchema.updateOne(
            { userID },
            {
              $set: { land: newLand }
            },
            {}
          );
        }
      }
      const channel = ctx.client.channels.cache.get("1374744395563270205");
      channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has sent multiple users to see Pumpkin Jack!`);
      await ctx.reply(`<:v_russell:1375161867152130182> Success! You've made some new ${role}!!`);
    }
    if (newLand == "neverland") {
      for (const results of neverland) {
        const userID = results;
        console.log(`userIDs: ${userID}`);
        const profile = await profileSchema.find({ userID });
        if (profile) {
          await profileSchema.updateOne(
            { userID },
            {
              $set: { land: newLand }
            },
            {}
          );
        }
      }
      const channel = ctx.client.channels.cache.get("1374744395563270205");
      channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has sent multiple users to see Tink!`);
      await ctx.reply(`<:v_russell:1375161867152130182> Success! You've made some new ${role}!!`);
    }
    if (newLand == "wonderland") {
      for (const results of wonderland) {
        const userID = results;
        console.log(`userIDs: ${userID}`);
        const profile = await profileSchema.find({ userID });
        if (profile) {
          await profileSchema.updateOne(
            { userID },
            {
              $set: { land: newLand }
            },
            {}
          );
        }
      }
      const channel = ctx.client.channels.cache.get("1374744395563270205");
      channel.send(`<:v_russell:1375161867152130182> ${(await ctx.guild.members.fetch(ctx.user.id)).nickname} has sent multiple users to see The Mad Hatter!`);
      await ctx.reply(`<:v_russell:1375161867152130182> Success! You've made some new ${role}!!`);
    }
  }
});
export {
  special_updates_default as default
};
