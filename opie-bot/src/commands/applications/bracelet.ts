// src/commands/fight/collect-bead.ts
import {
  EmbedBuilder,
  GuildMember,
  MessageFlags,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import landsSchema from "../../models/profiles/lands-schema.js";
import userSchema from "../../models/profiles/user-schema.js";
import charmSchema from "../../models/core/charm-Schema.js";
import bProfile from "../../models/profiles/bprof-Schema.js";
import { getRemainingCooldown, handleCooldown } from "../../utils/cooldown.js";
import { publishConfig } from "@sern/publisher";

export default commandModule({
  name: "collect-bead",
  description: `Use this command to collect a bead for your friendship bracelet.`,
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!]
    }),
  ],

  execute: async (ctx) => {
    const remaining = await getRemainingCooldown("bracelet", ctx);
    const endTime = Math.floor((Date.now() + remaining) / 1000);
    // 1) Cooldown check
    if (
      !(await handleCooldown("bracelet", ctx, "1h", {
        useTimestampEmbed: true,
        title: "Charm Bracelet",
        color: "#c797ff",
        description1: `OH NO! You've dropped your bag of charms!`,
        description2: `You can pull again when you've collected them all <t:${endTime}:R>`,
      }))
    )
      return;

    // 2) Fetch necessary data
    const member = ctx.member as GuildMember;
    const user = await userSchema.findOne({ userID: ctx.user.id });
    const profile = await bProfile.findOne({ userID: ctx.user.id });
    if (!user || !profile) {
      return ctx.reply({
        content: "Profile not found.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 3) Add land points
    const reward = 25;
    const landName = user.land
      .split(" ")
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
    await landsSchema.findOneAndUpdate(
      { name: landName },
      { $inc: { totalPoints: reward } }
    );

    // 4) Prepare bracelet options
    const braceletLetters = "F K";
    const braceletShapes = [
      "PurpleHeart",
      "PurpleHeart",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "PurpleCircle",
      "BlueOval",
      "BlueOval",
      "BlueOval",
      "BlueOval",
      "GreenOval",
      "GreenOval",
      "GreenOval",
      "GreenOval",
      "PinkOval",
      "PinkOval",
      "PinkOval",
      "PinkOval",
    ];

    await bProfile.updateOne(
      { userID: ctx.user.id },
      { $set: { bLetters: braceletLetters, bShapes: braceletShapes } }
    );

    // 5) Fetch charms
    const letterCharms = await charmSchema.find({ cType: "letter" });
    const shapeCharms = await charmSchema.find({ cType: "shape" });
    const letterPool = letterCharms.map((c) => ({
      name: c.cName,
      value: c.cImage,
    }));
    const shapePool = shapeCharms.map((c) => ({
      name: c.cName,
      value: c.cImage,
    }));

    // 6) Attempt matches
    let matchedBead: { name: string; value: string } | null = null;
    let matchType: "letter" | "shape" | null = null;
    const missed: { name: string; value: string }[] = [];

    for (let i = 0; i < 3; i++) {
      const pick = letterPool[Math.floor(Math.random() * letterPool.length)];
      if (braceletLetters.includes(pick.name)) {
        matchedBead = pick;
        matchType = "letter";
        break;
      }
      missed.push(pick);
    }
    if (!matchedBead) {
      for (let i = 0; i < 2; i++) {
        const pick = shapePool[Math.floor(Math.random() * shapePool.length)];
        if (braceletShapes.includes(pick.name)) {
          matchedBead = pick;
          matchType = "shape";
          break;
        }
        missed.push(pick);
      }
    }
    if (!matchedBead) {
      const allMissed = missed.length ? missed : [...letterPool, ...shapePool];
      matchedBead = allMissed[Math.floor(Math.random() * allMissed.length)];
      matchType = null;
    }

    // 7) Update user profile lists
    if (matchType === "letter") {
      await bProfile.updateOne(
        { userID: ctx.user.id },
        { $push: { letters: matchedBead.name } }
      );
    } else if (matchType === "shape") {
      await bProfile.updateOne(
        { userID: ctx.user.id },
        { $push: { shapes: matchedBead.name } }
      );
    }

    // 8) Build embed with array.join formatting preserving branching
    const formattedName = matchedBead.name.replace(/([a-z])([A-Z])/g, "$1 $2");
    const embed = new EmbedBuilder()
      .setColor("#c797ff")
      .setTitle(`<:fk_colorsparkles:1367215313309138995> FRIENDSHIP BRACELETS`)
      .setThumbnail(matchedBead.value);

    if (matchType === "letter") {
      embed.setDescription(
        [
          `### Hooray! You found the shimmering letter **${formattedName}** bead!`,
          "",
          `-# <:fk_arrow_p:1333840032590594058> ${member.displayName} found the shimmering letter **${formattedName}** bead.`,
          `-# <:fk_arrow_p:1333840032590594058> ${member.displayName} earned **${reward}** jewels!`,
        ].join("\n")
      );
    } else if (matchType === "shape") {
      embed.setDescription(
        [
          `### Hooray! You discovered the shimmering **${formattedName}** bead!`,
          "",
          `-# <:fk_arrow_p:1333840032590594058> ${member.displayName} found the shimmering **${formattedName}** bead.`,
          `-# <:fk_arrow_p:1333840032590594058> ${member.displayName} earned **${reward}** jewels!`,
        ].join("\n")
      );
    } else {
      embed.setDescription(
        [
          `### Oops! You pulled a **${formattedName}** bead, but it doesn’t fit your bracelet.`,
          "Let's put it back, maybe someone else could use it.",
          "",
          `-# <:fk_arrow_p:1333840032590594058> ${member.displayName} earned **${reward}** jewels`,
        ].join("\n")
      );
    }

    embed.setImage("https://i.imgur.com/U9KkF1Q.png");

    // 9) Public log
    const logChannel = ctx.client.channels.cache.get(
      "1368568447822467102"
    ) as TextChannel;
    logChannel?.send(
      `<:v_opie:1376727584435474542> ${member.displayName} got the ${formattedName} bead and earned ${reward} jewels.`
    );

    // 10) Reply
    await ctx.reply({ embeds: [embed] });
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator]
};
