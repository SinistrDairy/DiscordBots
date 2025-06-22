import {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import { publishConfig } from "@sern/publisher";
var end_task_default = commandModule({
  name: "end-task",
  description: "End a task and allocate jewels to the three lands.",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "task",
      description: "Name of the task to end",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "agrabah",
      description: "Jewels for Agrabah",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "hundred_acre_wood",
      description: "Jewels for Hundred Acre Wood",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "monstropolis",
      description: "Jewels for Monstropolis",
      required: true
    }
  ],
  execute: async (ctx) => {
    if (ctx.interaction.isAutocomplete())
      return;
    await ctx.interaction.deferReply();
    try {
      const eventName = ctx.options.getString("task", true).toUpperCase();
      const inputs = [
        { name: "Agrabah", jewels: ctx.options.getNumber("agrabah", true) },
        {
          name: "Hundred Acre Wood",
          jewels: ctx.options.getNumber("hundred_acre_wood", true)
        },
        {
          name: "Monstropolis",
          jewels: ctx.options.getNumber("monstropolis", true)
        }
      ];
      await Promise.all(
        inputs.map(
          ({ name, jewels }) => landsSchema.findOneAndUpdate(
            { name },
            { $inc: { totalPoints: jewels } }
          )
        )
      );
      const detailed = await Promise.all(
        inputs.map(async ({ name, jewels }) => {
          const land = await landsSchema.findOne({ name });
          return { name, jewels, emojiID: land?.emojiID ?? "" };
        })
      );
      detailed.sort((a, b) => b.jewels - a.jewels);
      let landOrder = "";
      const member = await ctx.guild.members.fetch(ctx.user.id);
      const actor = member.nickname ?? ctx.user.username;
      const logChan = ctx.client.channels.cache.get("1374744395563270205");
      for (const { name, jewels, emojiID } of detailed) {
        landOrder += `${name}: **${jewels}** ${emojiID}
`;
        if (logChan?.isTextBased()) {
          await logChan.send(
            `<:v_russell:1375161867152130182> ${actor} added ${jewels} jewels to ${name}`
          );
        }
      }
      const announce = `**${eventName} TOTALS**
${landOrder}
Check <#830617045741731910> for upcoming events!`;
      const publicIds = ["1374744395563270205", "1220081937906008144"];
      for (const id of publicIds) {
        const ch = ctx.client.channels.cache.get(id);
        if (ch?.isTextBased()) {
          await ch.send(
            `<:v_russell:1375161867152130182> ${actor} has ended ${eventName}`
          );
        }
      }
      return await ctx.interaction.editReply({
        content: announce,
        allowedMentions: { parse: ["roles", "users"] }
      });
    } catch (err) {
      console.error("[end-task] error:", err);
      try {
        await ctx.interaction.editReply({
          content: "\u26A0\uFE0F Something went wrong ending the task."
        });
      } catch {
      }
    }
  }
});
export {
  end_task_default as default
};
