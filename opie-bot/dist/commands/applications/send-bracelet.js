import {
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import userSchema from "../../models/profiles/user-schema.js";
import bProfile from "../../models/profiles/bprof-Schema.js";
import { publishConfig } from "@sern/publisher";
import landsSchema from "../../models/profiles/lands-schema.js";
var send_bracelet_default = commandModule({
  name: "send-bracelet",
  description: "Send your finished bracelet to another member in the server.",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2]
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "member",
      description: "Which member would you like to send a bracelet to?",
      required: true
    }
  ],
  execute: async (ctx) => {
    const target = ctx.options.getUser("member", true);
    if (target?.bot === true) {
      let warning = "Do not tag bots";
      ctx.reply({ flags: MessageFlags.Ephemeral, content: warning }).then(() => setTimeout(() => ctx.interaction.deleteReply(), 1e4));
      return;
    }
    if (target.id === ctx.user.id) {
      return ctx.reply({
        flags: MessageFlags.Ephemeral,
        content: "You cannot send a bracelet to yourself."
      }).then(() => setTimeout(() => ctx.interaction.deleteReply(), 1e4));
    }
    let query = {
      userID: ctx.user.id
    };
    const member = await ctx.guild?.members.fetch(ctx.user.id);
    const tMember = await ctx.guild?.members.fetch(target.id);
    const user = await userSchema.findOne(query);
    const profile = await bProfile.findOne(query);
    const tProfile = await bProfile.findOne({ userID: target.id });
    if (member && user && profile && tProfile) {
      const checkBLetters = typeof profile?.bLetters === "string" ? profile.bLetters : "";
      const checkBShapes = Array.isArray(profile.bShapes) ? profile.bShapes : [];
      let bLetters = checkBLetters.replace(/[,\s]+$/, "").split(" ").filter((char) => char.trim() !== "");
      let bShapes = checkBShapes.filter(
        (word) => typeof word === "string" && word.trim() !== ""
      );
      if (bLetters.length === 0 && bShapes.length === 0) {
        const noP = new EmbedBuilder().setColor("Red").setTitle(`NO BEADS FOUND`).setDescription(
          `It looks as if you haven't collected any beads. Once you've run the command \`/collect-bead\` then you can try this again. `
        );
        await ctx.reply({ embeds: [noP] });
        return;
      }
      if (profile.isComplete === true) {
        let removeMatchedItems2 = function(collected, required) {
          const collectedCounts = {};
          const requiredCounts = {};
          const itemsToTransfer = [];
          const remainingCollected = [];
          for (const item of collected) {
            const key = item.toLowerCase().trim();
            collectedCounts[key] = (collectedCounts[key] || 0) + 1;
          }
          for (const item of required) {
            const key = item.toLowerCase().trim();
            requiredCounts[key] = (requiredCounts[key] || 0) + 1;
          }
          const usedCounts = {};
          for (const item of collected) {
            const key = item.toLowerCase().trim();
            const needed = requiredCounts[key] || 0;
            const used = usedCounts[key] || 0;
            if (used < needed) {
              itemsToTransfer.push(item);
              usedCounts[key] = used + 1;
            } else {
              remainingCollected.push(item);
            }
          }
          return [itemsToTransfer, remainingCollected];
        };
        var removeMatchedItems = removeMatchedItems2;
        const jewels = 100;
        const landName = user.land.split(" ").map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(" ");
        await landsSchema.findOneAndUpdate(
          {
            name: landName
          },
          {
            $inc: { totalPoints: jewels }
          }
        );
        const cLetters = Array.isArray(profile.letters) ? profile.letters : [];
        const cShapes = Array.isArray(profile.shapes) ? profile.shapes : [];
        const bLetters2 = Array.isArray(profile.bLetters) ? profile.bLetters : typeof profile.bLetters === "string" ? profile.bLetters.split(" ").filter((l) => l.trim() !== "") : [];
        const bShapes2 = Array.isArray(profile.bShapes) ? profile.bShapes : [];
        const [lettersToSend, updatedLetters] = removeMatchedItems2(
          cLetters,
          bLetters2
        );
        const [shapesToSend, updatedShapes] = removeMatchedItems2(
          cShapes,
          bShapes2
        );
        profile.letters = updatedLetters;
        profile.shapes = updatedShapes;
        profile.isComplete = false;
        tProfile.letters = [...tProfile.letters || [], ...lettersToSend];
        tProfile.shapes = [...tProfile.shapes || [], ...shapesToSend];
        tProfile.isComplete = true;
        await profile.save();
        const transferred = new EmbedBuilder().setColor("#c797ff").setTitle("<:fk_colorsparkles:1367215313309138995> A GIFT FOR YOU!").setThumbnail("https://i.imgur.com/d2nRhYf.png").setDescription(
          `### I wouldn't have nothing, if I didn't have you!
            This server wouldn't be the same without you, ${tMember?.nickname}! I made this just for you. 
            

-# From: ${member.nickname} - They've received __**${jewels}**__ <:fk_jewel:1333402533439475743>`
        );
        console.log(`<:v_opie:1376727584435474542> Transferred`);
        const channel = ctx.client.channels.cache.get(
          "1368568447822467102"
        );
        channel.send(
          `${member.displayName} has sent their bracelet to ${tMember?.displayName}`
        );
        await ctx.reply({
          content: `<@${tMember?.id}>`,
          embeds: [transferred],
          allowedMentions: { parse: ["users"] }
        });
      } else {
        let warning = "You have not collected everything for the bracelet. Check your profile to see what you're missing!";
        ctx.reply({ flags: MessageFlags.Ephemeral, content: warning });
        return;
      }
    }
  }
});
const config = {
  guildIds: [process.env.GUILD_ID],
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator]
};
export {
  config,
  send_bracelet_default as default
};
