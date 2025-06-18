import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import eventSchema from "../../models/profiles/event-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";
var add_event_default = commandModule({
  name: "add-event",
  description: `Use this command to add an event.`,
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.Administrator]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    })
  ],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: `Name of the event?`,
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "points",
      description: "Enter in the points used in this event separated by a comma with no spaces.",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "title",
      description: "Enter the title for the event",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "bullet",
      description: "Enter the emoji you would like to use as bullet points",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "rules",
      description: "Enter the rules for the event separated by a comma with no spaces.",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "tags",
      description: `Enter who you would like to tag for the event.`,
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "scoring",
      description: "Enter the rules for scoring the event separated by a comma with no spaces.",
      required: false
    }
  ],
  execute: async (ctx) => {
    if (!ctx) {
      return;
    }
    const eventName = ctx.options.getString("name", true)?.toLowerCase();
    const eventPoints = ctx.options.getString("points", true);
    const title = ctx.options.getString("title", true);
    const emojiID = ctx.options.getString("bullet", true);
    const rules = ctx.options.getString("rules", true);
    const scoring = ctx.options.getString("scoring", false);
    const tags = ctx.options.getString("tags", true);
    const ePointArray = eventPoints?.split(",");
    const eRulesArray = rules?.split(",");
    const eScoreArray = scoring?.split(",");
    let eventData;
    try {
      eventData = await eventSchema.findOne({ name: eventName });
      if (!eventData) {
        let event = await eventSchema.create({
          name: eventName,
          pointList: ePointArray,
          title,
          emojiID,
          daRulez: eRulesArray,
          scoring: eScoreArray,
          tags,
          serverID: ctx.guildId
        });
        event.save();
      }
    } catch (err) {
      console.log(err);
    }
    await ctx.reply(`<:v_russell:1375161867152130182> added ${eventName} to the list.`);
  }
});
export {
  add_event_default as default
};
