import {
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import userProf from "../../models/profiles/user-schema.js";
import braceletProf from "../../models/profiles/bprof-Schema.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
var check_profiles_default = commandModule({
  name: "check-profile",
  description: "Admins use this command to view target user's bracelet profile.",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator])
  ],
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "member",
      description: "Which member's bracelet profile would you like to view?",
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
    let tQuery = {
      userID: target.id
    };
    const uProf = await userProf.findOne(tQuery);
    const bProf = await braceletProf.findOne(tQuery);
    const tMember = await ctx.guild?.members.fetch(target.id);
    if (uProf && bProf && tMember) {
      let countDuplicates2 = function(arr) {
        const counts = {};
        for (const item of arr) {
          counts[item] = (counts[item] || 0) + 1;
        }
        return counts;
      }, hasCollectedAll2 = function(required, collected) {
        const requiredCounts = countDuplicates2(required);
        const collectedCounts = countDuplicates2(collected);
        return Object.entries(requiredCounts).every(([item, count]) => {
          return collectedCounts[item] >= count;
        });
      };
      var countDuplicates = countDuplicates2, hasCollectedAll = hasCollectedAll2;
      const checkBLetters = typeof bProf?.bLetters === "string" ? bProf.bLetters : "";
      const checkBShapes = Array.isArray(bProf.bShapes) ? bProf.bShapes : [];
      let bLetters = checkBLetters.replace(/[,\s]+$/, "").split(" ").filter((char) => char.trim() !== "");
      let bShapes = checkBShapes.filter(
        (word) => typeof word === "string" && word.trim() !== ""
      );
      if (bLetters.length === 0 && bShapes.length === 0) {
        const noP = new EmbedBuilder().setColor("Red").setTitle(`NO BEADS FOUND`).setDescription(
          `It looks as if the user hasn't collected any beads. They will need to run the command \`/collect-bead\` then you can try this again.`
        );
        await ctx.reply({ embeds: [noP] });
        return;
      }
      let cLetters = bProf.letters;
      let cShapes = bProf.shapes;
      const sortedCLetters = cLetters.sort();
      const sortedCShapes = cShapes.sort();
      const sortedBletters = bLetters.sort();
      const sortedBShapes = bShapes.sort();
      const duplicateC = countDuplicates2(sortedCLetters);
      const duplicateB = countDuplicates2(sortedBletters);
      const duplicateCShapes = countDuplicates2(sortedCShapes);
      const duplicateBShapes = countDuplicates2(sortedBShapes);
      const allLetters = /* @__PURE__ */ new Set([
        ...Object.keys(duplicateB),
        ...Object.keys(duplicateC)
      ]);
      const allShapes = /* @__PURE__ */ new Set([
        ...Object.keys(duplicateBShapes),
        ...Object.keys(duplicateCShapes)
      ]);
      const formattedCLetters = Array.from(allLetters).map((letter) => {
        const correctCount = duplicateC[letter] || 0;
        const total = duplicateB[letter] || 0;
        return `${letter} (${correctCount} of ${total})`;
      }).join("\n");
      const formattedCshapes = Array.from(allShapes).map((shape) => {
        const readableShape = shape.replace(/([a-z])([A-Z])/g, "$1 $2");
        const correctCount = duplicateCShapes[shape] || 0;
        const total = duplicateBShapes[shape] || 0;
        return `${readableShape} (${correctCount} of ${total})`;
      }).join("\n");
      const hasAllLetters = hasCollectedAll2(bLetters, cLetters);
      const hasAllShapes = hasCollectedAll2(bShapes, cShapes);
      const isBComplete = hasAllLetters && hasAllShapes;
      const embeds = [];
      if (isBComplete) {
        const isComplete = new EmbedBuilder().setColor("#c797ff").setTitle(`<:fk_colorsparkles:1367215313309138995> ${tMember.nickname}'s Bracelet`).setDescription(
          `This user has collected all of the beads
-# They can send this bracelet to a friend by using the \`/send-bracelet\` command`
        ).addFields(
          { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
          { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
        ).setImage("https://i.imgur.com/8WkXKiK.png");
        embeds.push(isComplete);
      } else {
        const notComplete = new EmbedBuilder().setColor("#c797ff").setTitle(
          `<:fk_colorsparkles:1367215313309138995> ${tMember.nickname}'s Bracelet`
        ).setDescription(
          `The beads ${tMember.nickname} has collected are listed below.`
        ).addFields(
          { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
          { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
        ).setImage("https://i.imgur.com/U9KkF1Q.png");
        embeds.push(notComplete);
      }
      await ctx.reply({ embeds });
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
  check_profiles_default as default
};
