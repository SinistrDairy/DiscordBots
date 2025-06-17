import {
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
  MessageFlagsBitField,
  MessageFlags,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import userProf from "../../models/profiles/user-schema.js";
import braceletProf from "../../models/profiles/bprof-Schema.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";

export default commandModule({
  name: "view-bracelet",
  description: "View your bracelet and extra charms.",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
    }),
  ],

  execute: async (ctx) => {
    let query = {
      userID: ctx.user.id,
    };

    const uProf = await userProf.findOne(query);
    const bProf = await braceletProf.findOne(query);
    const member = await ctx.guild?.members.fetch(ctx.user.id);

    if (uProf && bProf && member) {
      const checkBLetters =
        typeof bProf?.bLetters === "string" ? bProf.bLetters : "";
      const checkBShapes = Array.isArray(bProf.bShapes) ? bProf.bShapes : [];
      let bLetters = checkBLetters
        .replace(/[,\s]+$/, "")
        .split(" ")
        .filter((char) => char.trim() !== "");
      let bShapes = checkBShapes.filter(
        (word) => typeof word === "string" && word.trim() !== ""
      );

      if (bLetters.length === 0 && bShapes.length === 0) {
        const noP = new EmbedBuilder()
          .setColor("Red")
          .setTitle(`NO BEADS FOUND`)
          .setDescription(
            `It looks as if you haven't collected any beads. Once you've run the command \u0060/collect-bead\u0060 then you can try this again. `
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

      // Count duplicates
      function countDuplicates(arr: string[]): Record<string, number> {
        const counts: Record<string, number> = {};
        for (const item of arr) {
          counts[item] = (counts[item] || 0) + 1;
        }
        return counts;
      }

      const duplicateC = countDuplicates(sortedCLetters);
      const duplicateB = countDuplicates(sortedBletters);
      const duplicateCShapes = countDuplicates(sortedCShapes);
      const duplicateBShapes = countDuplicates(sortedBShapes);

      const allLetters = new Set([
        ...Object.keys(duplicateB),
        ...Object.keys(duplicateC),
      ]);
      const allShapes = new Set([
        ...Object.keys(duplicateBShapes),
        ...Object.keys(duplicateCShapes),
      ]);

      const formattedCLetters = Array.from(allLetters)
        .map((letter) => {
          const correctCount = duplicateC[letter] || 0;
          const total = duplicateB[letter] || 0;
          return `${letter} (${correctCount} of ${total})`;
        })
        .join("\n");
      const formattedCshapes = Array.from(allShapes)
        .map((shape) => {
          const readableShape = shape.replace(/([a-z])([A-Z])/g, "$1 $2");
          const correctCount = duplicateCShapes[shape] || 0;
          const total = duplicateBShapes[shape] || 0;
          return `${readableShape} (${correctCount} of ${total})`;
        })
        .join("\n");

      function hasCollectedAll(required: string[], collected: string[]) {
        const requiredCounts = countDuplicates(required);
        const collectedCounts = countDuplicates(collected);

        return Object.entries(requiredCounts).every(([item, count]) => {
          return collectedCounts[item] >= count;
        });
      }

      const hasAllLetters = hasCollectedAll(bLetters, cLetters);
      const hasAllShapes = hasCollectedAll(bShapes, cShapes);
      const isBComplete = hasAllLetters && hasAllShapes;

      const embeds = [];

      if (isBComplete) {
        bProf.isComplete = true;
        await bProf.save();

        const isComplete = new EmbedBuilder()
          .setColor("#c797ff")
          .setTitle(`<:fk_colorsparkles:1367215313309138995> YOUR BRACELET`)
          .setDescription(
            `### CONGRATULATIONS!
          \nYou've collected all of the beads\n-# Send this bracelet to a friend by using the \u0060/send-bracelet\u0060 command`
          )
          .addFields(
            { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
            { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
          )
          .setImage("https://i.imgur.com/8WkXKiK.png");

        embeds.push(isComplete);
      } else {
        bProf.isComplete = false;
        await bProf.save();
        const notComplete = new EmbedBuilder()
          .setColor("#c797ff")
          .setTitle(`<:fk_colorsparkles:1367215313309138995> YOUR BRACELET`)
          .setDescription(
            `Collect all the beads to reveal the bracelet in the image below!\n\n-# Once you've collected all the beads, send it to a friend by using the \u0060/send-bracelet\u0060 command`
          )
          .addFields(
            { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
            { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
          )
          .setImage("https://i.imgur.com/U9KkF1Q.png");

        embeds.push(notComplete);
      }

      await ctx.reply({ embeds, flags: MessageFlags.Ephemeral });
    }
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID],
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
};
