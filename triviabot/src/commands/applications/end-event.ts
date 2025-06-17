import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
  type TextBasedChannel,
  TextChannel,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import { requirePermission } from "../../plugins/requirePermission.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { publishConfig } from "@sern/publisher";

// Constants & Types
const ANNOUNCE_CHANNEL_ID     = "1374744395563270205";
const LOG_CHANNEL_ID          = "1220081937906008144";
const WEEKLY_EVENTS_CHANNEL   = "830617045741731910";
const DEFAULT_LANDS_COUNT     = 3;
const MIN_SPECIAL_LANDS_COUNT = 2;
const MAX_SPECIAL_LANDS_COUNT = 4;

interface LandResult {
  name:         string;
  triviaPoints: number;
  emojiID:      string;
  roleID:       string;
}

// Autocomplete helper for events
async function suggestEvents(ctx: any) {
  const focus = ctx.options.getFocused(false).toLowerCase();
  // TODO: add a cache here to avoid hitting Mongo on every keystroke
  const events = await eventSchema.find().select("name").lean();
  const choices = events
    .map((e: any) => e.name)
    .filter((n: string) => n.toLowerCase().startsWith(focus))
    .slice(0, 25)
    .map((n: string) => ({ name: n, value: n }));
  await ctx.respond(choices);
}

// Builds the header string, special-cases Jafar
function buildHeader(eventName: string): string {
  if (eventName === `JAFAR'S JUMBLES`) {
    return `## ***<:fk_jafar:831617308606726174> YOU LITTLE FOOL, HOW COULD IT BE? ...***\n`;
  }
  return `## <a:fk_sparkles:1073627951989534800> **${eventName} TOTALS** <a:fk_sparkles:1073627951989534800>\n`;
}

export default commandModule({
  name:        "end-event",
  description: "Use this command to end your event!",
  type:        CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages
    }),
  ],
  options: [
    {
      type:         ApplicationCommandOptionType.String,
      name:         "event",
      description:  "Choose which event you were hosting",
      required:     true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: suggestEvents,
      },
    },
    {
      type:        ApplicationCommandOptionType.Boolean,
      name:        "special",
      description: `Is this a special event month?`,
      required:    true,
    },
    {
      type:        ApplicationCommandOptionType.Number,
      name:        "land-count",
      description: `How many lands are competing?`,
      required:    false,
    },
  ],

  execute: async (ctx) => {
    try {
      // Validate & fetch the event
      const rawEventName = ctx.options.getString("event", true);
      const eventDoc = await eventSchema
        .findOne({ name: rawEventName })
        .select("name")
        .lean();
      if (!eventDoc) {
        return ctx.reply({
          content: `<:x_opie:1376727567461253150> Event \"${rawEventName}\" does not exist.`,
          flags:   MessageFlags.Ephemeral,
        });
      }
      const eventName = eventDoc.name.toUpperCase();

      // Fetch invoker display name
      const member      = await ctx.guild!.members.fetch(ctx.user.id);
      const invokerName = member.nickname ?? member.user.username;

      // Determine how many lands
      const special   = ctx.options.getBoolean("special", true);
      const rawCount  = ctx.options.getNumber("land-count", false) ?? DEFAULT_LANDS_COUNT;
      const landCount = special
        ? Math.min(MAX_SPECIAL_LANDS_COUNT, Math.max(MIN_SPECIAL_LANDS_COUNT, rawCount))
        : DEFAULT_LANDS_COUNT;

      // Fetch top lands by triviaPoints
      const lands = (await landsSchema
        .find({ special })
        .sort({ triviaPoints: -1 })
        .limit(landCount)
        .lean()) as unknown as LandResult[];

      if (lands.length === 0) {
        return ctx.reply({
          content: `<:x_opie:1376727567461253150> No lands found to process.`,
          flags:   MessageFlags.Ephemeral,
        });
      }

      // Bulk-write updates: add triviaPoints to totalPoints and reset triviaPoints
      const bulkOps = lands.map(({ roleID, triviaPoints }) => ({
        updateOne: {
          filter: { roleID },
          update: {
            $inc: { totalPoints: triviaPoints },
            $set: { triviaPoints: 0 },
          },
        },
      }));
      await landsSchema.bulkWrite(bulkOps);

      // Prepare channels and cast to TextBasedChannel for send()
      const announceChannel = ctx.client.channels.cache.get(
        ANNOUNCE_CHANNEL_ID
      ) as TextChannel;
      const logChannel = ctx.client.channels.cache.get(
        LOG_CHANNEL_ID
      ) as TextChannel;
      if (!announceChannel || !logChannel) {
        return ctx.reply({
          content: "⚠️ Could not find one of the target channels or it's not text-based.",
          flags:   MessageFlags.Ephemeral,
        });
      }

      // Build lines and send individual logs
      const lines = lands.map(({ name, triviaPoints, emojiID }) =>
        `${name}: **${triviaPoints}** ${emojiID}`
      );
      for (const { name, triviaPoints } of lands) {
        await announceChannel.send(
          `<:v_russell:1375161867152130182> ${invokerName} added ${triviaPoints} jewels to ${name}`
        );
      }

      // Build final announcement string
      const header      = buildHeader(eventName);
      const footer      = `\n-# Thank you for joining us! Don't forget to check out <#${WEEKLY_EVENTS_CHANNEL}> for our weekly scheduled events.`;
      const endAnnounce = `${header}${lines.join("\n")}${footer}`;

      // Broadcast the “has ended” message
      const endMsg = `<:v_russell:1375161867152130182> ${invokerName} has ended ${eventName}`;
      await announceChannel.send(endMsg);
      await logChannel.send(endMsg);

      // Reply to the user with the totals
      return ctx.reply({
        content:         endAnnounce,
        allowedMentions: { parse: ["roles", "users"] },
      });
    } catch (err) {
      console.error("[end-event] error:", err);
      return ctx.reply({
        content: "⚠️ Something went wrong ending your event. Please try again later.",
        flags:   MessageFlags.Ephemeral,
      });
    }
  },
});
