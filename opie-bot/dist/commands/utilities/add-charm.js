import { commandModule, CommandType } from "@sern/handler";
import {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} from "discord.js";
import beadSchema from "../../models/core/charm-Schema.js";
import { publishConfig } from "@sern/publisher";
import { requirePermission } from "../../plugins/requirePermission.js";
var add_charm_default = commandModule({
  name: "add-beads",
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      guildIds: [process.env.GUILD_ID1, process.env.GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }),
    requirePermission("user", [PermissionFlagsBits.Administrator])
  ],
  description: "Use this command to add more beads to the bracelet.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "new-bead",
      description: "The name of the bead.",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "bead-image",
      description: "bead image",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "type",
      description: "what type of bead is it?",
      required: true,
      autocomplete: true,
      command: {
        onEvent: [],
        execute: async (ctx) => {
          const focus = ctx.options.getFocused();
          const choice = ["letter", "shape"];
          const filter = choice.filter((t) => t.startsWith(focus));
          await ctx.respond(
            filter.map((title) => ({ name: title, value: title }))
          );
        }
      }
    }
  ],
  execute: async (ctx) => {
    const cName = ctx.options.getString("new-bead");
    const cImage = ctx.options.getString("bead-image");
    const cType = ctx.options.getString("type");
    let beadData;
    try {
      beadData = await beadSchema.findOne({ cName });
      if (!beadData) {
        let cProfile = await beadSchema.create({
          cName,
          cImage,
          cType
        });
        cProfile.save();
      } else {
        await ctx.reply(`Already have ${cName}`);
        return;
      }
    } catch (err) {
      console.log(err);
    }
    await ctx.reply(`added ${cName}`);
  }
});
export {
  add_charm_default as default
};
