// src/commands/fight/endfight.ts
import {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
import FightState from "../../models/core/fightstate-Schema.js";
import charSchema from "../../models/core/char-Schema.js";
import Profile from "../../models/profiles/sprof-Schema.js";

export default commandModule({
  name: "endfight",
  description: "End the Splash Showdown",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    }),
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
  ],
  execute: async (ctx) => {
    const member = await ctx.guild?.members.fetch(ctx.user.id);
    if (!member) {
      return await ctx.reply("no current member information");
    }

    const guild = ctx.guild!;

    // ✅ Check if a fight is active
    const fight = await FightState.findOne({ serverID: guild.id });
    if (!fight?.active) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> The Splash Showdown hasn’t started yet! There's nothing to end. Did you mean `/startfight`?",
        flags: MessageFlags.Ephemeral,
      });
    }

    // ✅ Mark the fight as inactive
    await FightState.findOneAndUpdate(
      { serverID: guild.id },
      { active: false },
      { upsert: true }
    );

    const character = await charSchema.findOne({ isChosen: true });
    if (!character) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> There are no currently active characters. Please use /start-fight",
        flags: MessageFlags.Ephemeral,
      });
    }
    character.isChosen = false;
    character.save();

    const embed = new EmbedBuilder()
      .setColor("#01dddd")
      .setTitle("THE SPLASH SHOWDOWN IS OVER!")
      .setDescription(
        [
          `OH NO, **${character.badGuy}** is here to break up the fun!`,
          "",
          "Everyone is told to go home! But, keep an eye out... who knows if another fight will start soon!",
        ].join("\n")
      )
      .setThumbnail(character.image)
      .setImage(
        "http://www.emhuf.xyz/uploads/Water_Gun_Event/1748307466248-611376657.png"
      );

    await Profile.updateMany(
      { serverID: guild.id },
      { $unset: { lastTarget: "" }, $set: { currSprays: 6, needsRefill: false, refillReadyAt: 0 } }
    );

    await ctx.reply({ embeds: [embed] });

    const channel = ctx.client.channels.cache.get(
      "1368568447822467102"
    ) as TextChannel;

    if (channel) {
      channel.send(
        `<:v_opie:1376727584435474542> ${member.nickname} has ended a water gun fight.`
      );
    }
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID2],
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
};
