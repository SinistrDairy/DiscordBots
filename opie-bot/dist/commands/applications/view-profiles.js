import {
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import userProf from "../../models/profiles/user-schema.js";
import braceletProf from "../../models/profiles/bprof-Schema.js";
import { publishConfig } from "@sern/publisher";
var view_profiles_default = commandModule({
  name: "view-bracelet",
  description: "View your bracelet and extra charms.",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2]
    })
  ],
  execute: async (ctx) => {
    let query = {
      userID: ctx.user.id
    };
    const uProf = await userProf.findOne(query);
    const bProf = await braceletProf.findOne(query);
    const member = await ctx.guild?.members.fetch(ctx.user.id);
    if (uProf && bProf && member) {
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
          `It looks as if you haven't collected any beads. Once you've run the command \`/collect-bead\` then you can try this again. `
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
        bProf.isComplete = true;
        await bProf.save();
        const isComplete = new EmbedBuilder().setColor("#c797ff").setTitle(`<:fk_colorsparkles:1367215313309138995> YOUR BRACELET`).setDescription(
          `### CONGRATULATIONS!
          
You've collected all of the beads
-# Send this bracelet to a friend by using the \`/send-bracelet\` command`
        ).addFields(
          { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
          { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
        ).setImage("https://i.imgur.com/8WkXKiK.png");
        embeds.push(isComplete);
      } else {
        bProf.isComplete = false;
        await bProf.save();
        const notComplete = new EmbedBuilder().setColor("#c797ff").setTitle(`<:fk_colorsparkles:1367215313309138995> YOUR BRACELET`).setDescription(
          `Collect all the beads to reveal the bracelet in the image below!

-# Once you've collected all the beads, send it to a friend by using the \`/send-bracelet\` command`
        ).addFields(
          { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
          { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
        ).setImage("https://i.imgur.com/U9KkF1Q.png");
        embeds.push(notComplete);
      }
      await ctx.reply({ embeds, flags: MessageFlags.Ephemeral });
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
  view_profiles_default as default
};
