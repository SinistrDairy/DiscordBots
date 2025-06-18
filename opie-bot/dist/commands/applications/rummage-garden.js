import {
  EmbedBuilder,
  MessageFlags
} from "discord.js";
import { commandModule, CommandType } from "@sern/handler";
import landsSchema from "../../models/profiles/lands-schema.js";
import userSchema from "../../models/profiles/user-schema.js";
import plantSchema from "../../models/core/plant-Schema.js";
import { getRemainingCooldown, handleCooldown } from "../../utils/cooldown.js";
import { publishConfig } from "@sern/publisher";
import { randomInt } from "crypto";
var rummage_garden_default = commandModule({
  name: "garden",
  description: `Rummage through Rabbit's Garden to see what you can find!`,
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2]
    })
  ],
  execute: async (ctx) => {
    const member = ctx.member;
    const roleIDs = /* @__PURE__ */ new Set(["1367191933335765032", "1364313155668410562"]);
    if (!member.roles.cache.some((r) => roleIDs.has(r.id))) {
      const noRole = new EmbedBuilder().setColor("Red").setTitle("__Subscription Not Found__").setThumbnail("https://i.imgur.com/vG26e94.png").setDescription(
        `We're sorry, but to use this command you must be an active subscriber.`
      );
      return ctx.reply({ embeds: [noRole], flags: MessageFlags.Ephemeral });
    }
    const remaining = await getRemainingCooldown("garden", ctx);
    const endTime = Math.floor((Date.now() + remaining) / 1e3);
    if (!await handleCooldown("garden", ctx, "6h", {
      useTimestampEmbed: true,
      title: "RABBIT'S GARDEN",
      color: "#ffd483",
      description1: `Well, well, well - it looks like *someone* is trying to pick plants before they've ripened.`,
      description2: `You can help Rabbit again <t:${endTime}:R>`
    }))
      return;
    const user = await userSchema.findOne({ userID: ctx.user.id });
    if (!user) {
      return ctx.reply({ content: "User profile not found.", flags: MessageFlags.Ephemeral });
    }
    const jewels = randomInt(25, 150);
    const rounded = Math.round(jewels / 25) * 25;
    const landName = user.land.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    const land = await landsSchema.findOneAndUpdate(
      { name: landName },
      { $inc: { totalPoints: rounded } },
      { new: true }
    );
    if (!land)
      return ctx.reply({ content: "Land not found.", flags: MessageFlags.Ephemeral });
    const plants = await plantSchema.find();
    const choice = plants[Math.floor(Math.random() * plants.length)];
    const embed = new EmbedBuilder().setColor("#ffd483").setTitle(`<:fk_rabbit:1365333465285001236> RABBIT'S GARDEN`).setThumbnail(choice.plantImage).setDescription(
      [
        `Well, well \u2013 would you look at that! A perfectly picked **${choice.plantName}**!`,
        `For once, someone's done it *properly*`,
        "",
        `-# <:fk_rabbitarr:1377672191239524372> ${member.displayName} picked **${choice.plantName}**`,
        `-# <:fk_rabbitarr:1377672191239524372> They've earned __**${rounded}**__ <:fk_jewel:1333402533439475743>`
      ].join("\n")
    ).setImage("https://i.imgur.com/uU9T6eF.png");
    const log = ctx.client.channels.cache.get(
      "1368568447822467102"
    );
    log?.send(
      `<:v_opie:1376727584435474542> ${ctx.user.globalName} earned ${rounded} jewels from /garden`
    );
    await ctx.reply({ embeds: [embed] });
  }
});
const config = {
  guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
  dmPermission: false
};
export {
  config,
  rummage_garden_default as default
};
