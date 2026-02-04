import {
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import userProf from "../../models/profiles/user-schema.js";
import braceletProf from "../../models/profiles/bprof-Schema.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";

export default commandModule({
  name: "check-profile",
  description:
    "Admins use this command to view target user's bracelet profile.",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator]),
  ],
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "member",
      description: "Which member's bracelet profile would you like to view?",
      required: true,
    },
  ],

  execute: async (ctx) => {
    const target = ctx.options.getUser("member", true);
    if (target?.bot === true) {
      let warning = "Do not tag bots";
      ctx
        .reply({ flags: MessageFlags.Ephemeral, content: warning })
        .then(() => setTimeout(() => ctx.interaction.deleteReply(), 10000));
      return;
    }
    if (target.id === ctx.user.id) {
      return ctx
        .reply({
          flags: MessageFlags.Ephemeral,
          content: "You cannot send a bracelet to yourself.",
        })
        .then(() => setTimeout(() => ctx.interaction.deleteReply(), 10000));
    }

    let tQuery = {
      userID: target.id,
    };

    const uProf = await userProf.findOne(tQuery);
    const bProf = await braceletProf.findOne(tQuery);
    const tMember = await ctx.guild?.members.fetch(target.id);

    if (uProf && bProf && tMember) {
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
            `It looks as if the user hasn't collected any beads. They will need to run the command \u0060/collect-bead\u0060 then you can try this again.`
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

        const isComplete = new EmbedBuilder()
          .setColor("#c797ff")
          .setTitle(`<:fk_colorsparkles:1367215313309138995> ${tMember.nickname}'s Bracelet`)
          .setDescription(
            `This user has collected all of the beads\n-# They can send this bracelet to a friend by using the \u0060/send-bracelet\u0060 command`
          )
          .addFields(
            { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
            { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
          )
          .setImage("https://i.imgur.com/8WkXKiK.png");

        embeds.push(isComplete);
      } else {
        const notComplete = new EmbedBuilder()
          .setColor("#c797ff")
          .setTitle(
            `<:fk_colorsparkles:1367215313309138995> ${tMember.nickname}'s Bracelet`
          )
          .setDescription(
            `The beads ${tMember.nickname} has collected are listed below.`
          )
          .addFields(
            { name: `Letters:`, value: `${formattedCLetters}`, inline: true },
            { name: `Shapes:`, value: `${formattedCshapes}`, inline: true }
          )
          .setImage("https://i.imgur.com/U9KkF1Q.png");

        embeds.push(notComplete);
      }

      await ctx.reply({ embeds });
    }
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID2],
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
};
