import {
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  MessageFlags,
  TextChannel,
} from "discord.js";
import { CommandType, commandModule } from "@sern/handler";
import braceletProf from "../../models/profiles/bprof-Schema.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";

export default commandModule({
  name: "adjust-beads",
  description:
    "Admins use this command to adjust beads on target user's bracelet profile.",
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
      description: "Which member's bracelet profile would you like to adjust?",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "bead-option1",
      description: `Would you like to give them all beads, or a specific bead?`,
      choices: [
        { name: "Single Bead", value: 1 },
        { name: "All Beads", value: 2 },
      ],
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "specific-bead",
      description: "Which bead would you like to give them?",
      required: false, // Only required if 'single' is selected
      autocomplete: true,
      command: {
        execute: async (ctx) => {
          const focus = ctx.options.getFocused();
          let query = { userID: ctx.user.id };
          const userProfile = await braceletProf.findOne(query);

          if (!userProfile) {
            return ctx.respond([]);
          }

          const seen = new Set<string>();
          const beadOptions: { name: string; value: string }[] = [];

          // Process bLetters: split and deduplicate
          if (typeof userProfile.bLetters === "string") {
            const letters = userProfile.bLetters.split(" ").filter(Boolean);
            for (const letter of letters) {
              if (!seen.has(letter)) {
                beadOptions.push({ name: letter, value: letter });
                seen.add(letter);
              }
            }
          }

          // Process bShapes: format and deduplicate
          if (Array.isArray(userProfile.bShapes)) {
            for (const shape of userProfile.bShapes) {
              if (!seen.has(shape)) {
                const formatted = shape.replace(/([a-z])([A-Z])/g, "$1 $2");
                beadOptions.push({ name: formatted, value: shape });
                seen.add(shape);
              }
            }
          }

          // Filter results by user input
          const filtered = beadOptions.filter((opt) =>
            opt.name.toLowerCase().startsWith(focus.toLowerCase())
          );

          await ctx.respond(filtered.slice(0, 25));
        },
      },
    },
  ],

  execute: async (ctx) => {
    
    const target = ctx.options.getUser("member", true);
    const beadOption = ctx.options.getNumber('bead-option1')
    const bead = ctx.options.getString("specific-bead", false);

    if (target.bot === true) {
      let warning = "Do not tag bots";
      ctx
      .reply({ flags: MessageFlags.Ephemeral, content: warning })
      .then(() => setTimeout(() => ctx.interaction.deleteReply(), 10000));
      return;
    }
    const single = beadOption === 1;
    const all = beadOption === 2;
    const tMember = await ctx.guild!.members.fetch(target.id);
    let query = { userID: target.id };
    const userProfile = await braceletProf.findOne(query);
    if (!userProfile) {
      return;
    }

    let beadName = "";
    function toPascalCase(str: string): string {
      return str
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
          index === 0 ? match.toUpperCase() : match.toUpperCase()
        )
        .replace(/\s+/g, ""); // Remove spaces
    }
    if (single) {
      if (!bead) {
        const warning = `❌ You selected 'Single Bead' but didn't specify which bead. Please try again.`;
        return ctx.reply({ content: warning, flags: MessageFlags.Ephemeral });
      }
    
      const beadName = toPascalCase(bead);

      const updateField = userProfile.bLetters?.includes(beadName) ? "letters" : "shapes";

      const result = await braceletProf.updateOne(
        { userID: target.id },
        { $push: { [updateField]: beadName } }
      );
    
      if (result.modifiedCount === 0) {
        const errorMessage = `❌ Failed to add '${beadName}' to ${tMember.nickname}'s ${updateField}. Please try again.`;
        await ctx.reply({ content: errorMessage, flags: MessageFlags.Ephemeral })
          .then(() => setTimeout(() => ctx.interaction.deleteReply(), 10000));
    
        const channel = ctx.client.channels.cache.get("1368568447822467102") as TextChannel;
        channel?.send(`❌ ${ctx.user.displayName} failed to add '${beadName}' to ${tMember.displayName}'s ${updateField}.`);
        return;
      }
    
      const successMessage = `✅ Added '${beadName}' to ${tMember.nickname}'s ${updateField}.`;
      await ctx.reply({ content: successMessage, flags: MessageFlags.Ephemeral })
        .then(() => setTimeout(() => ctx.interaction.deleteReply(), 10000));
    
      const channel = ctx.client.channels.cache.get("1368568447822467102") as TextChannel;
      channel?.send(`✅ ${ctx.user.displayName} added '${beadName}' to ${tMember.displayName}'s ${updateField}.`);
    }

    if (all) {
      try {
        const cLetters: string[] = []
        const cShapes: string[] = [];
    
        if (typeof userProfile.bLetters === "string") {
          const letters = userProfile.bLetters.split(" ").filter(Boolean);
          cLetters.push(...letters); // Spread the letters array to avoid nesting
        }
    
        if (Array.isArray(userProfile.bShapes)) {
          for (const shape of userProfile.bShapes) {
            // Ensure we're pushing just the shape string and not an object
            if (typeof shape === "string") {
              cShapes.push(shape);
            }
          }
        }
    
        if (cLetters.length > 0) {
          await braceletProf.updateOne(
            { userID: userProfile.userID },
            {
              $push: { letters: { $each: cLetters } },
            }
          );
        }
    
        if (cShapes.length > 0) {
          await braceletProf.updateOne(
            { userID: userProfile.userID },
            {
              $push: { shapes: { $each: cShapes } },
            }
          );
        }
        userProfile.isComplete = true;
    
        await userProfile.save();
    
        await ctx.reply({
          content: `All beads added to ${tMember.nickname}'s bracelet.`,
          flags: MessageFlags.Ephemeral,
        });
    
        const channel = ctx.client.channels.cache.get(
          "1368568447822467102"
        ) as TextChannel;
    
        if (channel) {
          channel.send(
            `✅ ${ctx.user.displayName} added all beads to ${tMember.displayName}.`
          );
        } else {
          console.error("Channel not found");
        }
    
      } catch (error) {
        console.error("Error processing the beads:", error);
        await ctx.reply({
          content: `❌ There was an error adding the beads. Please try again later.`,
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }
  },
});

export const config = {
  guildIds: [process.env.GUILD_ID], // Guild ID where this command is allowed to run
  dmPermission: false, // Disallow the command in DMs
  defaultMemberPermissions: [PermissionsBitField.Flags.Administrator], // Only admins can use this command
};
