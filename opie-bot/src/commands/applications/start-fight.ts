// src/commands/fight/startfight.ts
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
import { NonEmptyArray } from "../../plugins/publish.js";


export default commandModule({
  name: "startfight",
  description: "Begin the Splash Showdown",
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

    // ✅ check if a fight is already active
    const fight = await FightState.findOne({ serverID: guild.id });
    if (fight?.active) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> The Splash Showdown is already in progress! Did you mean `/end-fight`?",
        flags: MessageFlags.Ephemeral,
      });
    }

    // mark fight active
    await FightState.findOneAndUpdate(
      { serverID: ctx.guild!.id },
      { active: true },
      { upsert: true }
    );

    const characters = await charSchema.find({});
    if (!characters || characters.length === 0) {
      return ctx.reply({
        content:
          "<:x_opie:1376727567461253150> No characters found, please add a charcter using /add-character",
        flags: MessageFlags.Ephemeral,
      });
    }

    const chosenCharacter =
      characters[Math.floor(Math.random() * characters.length)];

    chosenCharacter.isChosen = true;

    chosenCharacter.save();

    const embed = new EmbedBuilder()
      .setColor("#01dddd")
      .setTitle("LET THE SPLASH SHOWDOWN BEGIN!")
      .setDescription(
        [
          `> From behind a bush, **${chosenCharacter.name}** lets out a giggle and then **SPLASH** A surprise water blast flies your way! The **Splash Showdown** has begun!`,
          "",
          "No one is safe, and the drench-fest could last _minutes…_ or _mayhem-filled hours!_",
          "",
          "**Think you're quick enough to join the chaos?**",
          "Type `/spray` to take aim and soak your target! <:fk_splash:1377306074423758999>",
          "",
          `-# <:fk_arrT:1377386293012463626> Your water level starts at 6. Once it reaches 0 you'll need to \u0060/refill\u0060`,
          `-# <:fk_arrY:1377386327619801188> 10s cooldown between sprays. Refills take __**1 minute**__`,
          `-# <:fk_arrR:1377386356048920709> Don’t spray the same person twice in a row!`,
        ].join("\n")
      )
      .setThumbnail(chosenCharacter.image)
      .setImage(
        "https://www.emhuf.xyz/uploads/Water_Gun_Event/1748463125796-193033977.png"
      );

    await ctx.reply({
      allowedMentions: { parse: ["roles"] },
      content: `<@&1377631158845837312>`,
      embeds: [embed],
    });

    const channel = ctx.client.channels.cache.get(
      "1368568447822467102"
    ) as TextChannel;
    channel.send(
      `<:v_opie:1376727584435474542> ${member?.nickname} has started a water gun fight.`
    );
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID2],
  dmPermission: false,
  defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
};
