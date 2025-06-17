import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits,
  TextChannel,
  User,
} from "discord.js";
import type { SernOptionsData } from "@sern/handler";
import { CommandType, commandModule } from "@sern/handler";
import userSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/trivia/lands-schema.js";
import eventSchema from "../../models/profiles/event-schema.js";
import { requirePermission } from "../../plugins/requirePermission.js";
import { publishConfig } from "@sern/publisher";

const placeNames = ["first", "second", "third", "fourth", "fifth"] as const;

const placementFields: (
  | "firsts"
  | "seconds"
  | "thirds"
  | "fourths"
  | "fifths"
)[] = ["firsts", "seconds", "thirds", "fourths", "fifths"];

// (optional) your emojis for announcing
const placementEmojis = [
  `<:fk_first:1369421461021921290>`,
  `<:fk_second:1369421501001891932>`,
  `<:fk_third:1369421537534546070>`,
  `<:fk_fourth:1369421575975207062>`,
  `<:fk_fifth:1369421616357965955>`,
] as const;

// 1) First, build your five “user” options as a SernOptionsData[]
const userOptions: SernOptionsData[] = placeNames.map((place, idx) => ({
  type: ApplicationCommandOptionType.User,
  name: place,
  description: `Choose the user who was in ${place} place`,
  required: idx === 0, // only “first” is required
}));

// 2) Then build your five “number” options, *also* as SernOptionsData[]
const pointOptions: SernOptionsData[] = placeNames.map((place, idx) => ({
  type: ApplicationCommandOptionType.Number,
  name: `${place}-points`,
  description: `Select the amount of points for ${place} place`,
  required: idx === 0,
  autocomplete: true,
  command: {
    onEvent: [],
    execute: async (ctx) => {
      const eventName = ctx.options.getString("event", true);
      const { value } = ctx.options.getFocused(true);
      const e = await eventSchema.findOne({ name: eventName });
      const list = e?.pointList ?? [];
      const choices = list
        .filter((p) => p.startsWith(value.toLowerCase()))
        .map((p) => ({ name: p, value: p }));
      await ctx.respond(choices);
    },
  },
}));

export default commandModule({
  name: "jewels",
  description: "Use this command to assign points after each question",
  type: CommandType.Slash,
  plugins: [
    requirePermission("user", [PermissionFlagsBits.ManageMessages]),
    publishConfig({
      guildIds: [process.env.GUILD_ID1!, process.env.GUILD_ID2!],
      defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    }),
  ],

  options: [
    // your existing “event” option
    {
      type: ApplicationCommandOptionType.String,
      name: "event",
      description: `Choose which type of event you’re running.`,
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const { value } = ctx.options.getFocused(true);
          const events = await eventSchema.find().select("name");
          const choices = events
            .map((e) => e.name)
            .filter((n) => n.toLowerCase().startsWith(value.toLowerCase()))
            .map((n) => ({ name: n, value: n }));
          await ctx.respond(choices);
        },
      },
    },

    // first (required) + first-points (required)
    userOptions[0],
    pointOptions[0],

    // then **all** optional slots, each with `required: false`
    userOptions[1],
    pointOptions[1],
    userOptions[2],
    pointOptions[2],
    userOptions[3],
    pointOptions[3],
    userOptions[4],
    pointOptions[4],
  ],

  execute: async (ctx) => {
    try {
      // Prevent tagging bots
      const users: (User | null)[] = [
        ctx.options.getUser("first", true),
        ctx.options.getUser("second"),
        ctx.options.getUser("third"),
        ctx.options.getUser("fourth"),
        ctx.options.getUser("fifth"),
      ];
      if (users.some((u) => u?.bot)) {
        return ctx.reply({
          content: "🚫 Don’t tag bots!",
          flags: MessageFlags.Ephemeral, // Ephemeral
        });
      }

      const eventName = ctx.options.getString("event", true);
      const eventDoc = await eventSchema.findOne({ name: eventName });
      if (!eventDoc) {
        return ctx.reply({
          content: `❌ Event "${eventName}" not found.`,
          flags: 64,
        });
      }

      // Determine which event array to update (fallback to "misc")
      const filterEventName = ["trivia", "pop quiz"].includes(
        eventName.toLowerCase()
      )
        ? eventName
        : "misc";

      const channel = ctx.client.channels.cache.get(
        "1374744395563270205"
      ) as TextChannel;

      let announcement = "";

      // Loop through each placement
      for (let i = 0; i < 5; i++) {
        const user = users[i];
        const points = ctx.options.getNumber(
          ["first", "second", "third", "fourth", "fifth"][i] + "-points"
        );
        if (!user || points == null || points <= 0) continue;

        // Log to designated channel
        await channel.send(
          `<:v_russell:1375161867152130182> ${
            (
              await ctx.guild!.members.fetch(ctx.user.id)
            ).nickname
          } added ${points} jewels to ${user.displayName}`
        );

        // Update user’s event stats
        const updateUser = await userSchema.updateOne(
          { userID: user.id, "events.name": filterEventName },
          {
            $inc: {
              [`events.$.${placementFields[i]}`]: points,
            },
          }
        );
        if (updateUser.matchedCount === 0) {
          // If user has no event array yet, push one
          await userSchema.updateOne(
            { userID: user.id },
            {
              $push: {
                events: {
                  name: filterEventName,
                  firsts: 0,
                  seconds: 0,
                  thirds: 0,
                  fourths: 0,
                  fifths: 0,
                  [placementFields[i]]: points,
                },
              },
            }
          );
        }

        // Update land points
        const profile = await userSchema.findOne({ userID: user.id });
        const landName =
          profile?.land
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" ") ?? null;
        if (landName) {
          await landsSchema.updateOne(
            { name: landName },
            { $inc: { triviaPoints: points } }
          );
        }

        // Build announcement line
        announcement += `${placementEmojis[i]} <@${user.id}> • ${points}\n`;
      }

      if (!announcement) {
        return ctx.reply({
          content: "No valid placements or points provided.",
          flags: MessageFlags.Ephemeral,
        });
      }

      return ctx.reply({
        content: announcement,
        allowedMentions: { parse: ["users"] },
      });
    } catch (error) {
      console.error("[/jewels] error:", error);
      return ctx.reply({
        content: "❗ Something went wrong assigning jewels.",
        flags: 64,
      });
    }
  },
});
