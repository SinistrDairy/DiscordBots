import { CommandType, commandModule } from "@sern/handler";
import { MessageFlags } from "discord.js";
import eventSchema from "../../../models/profiles/event-schema.js";

export default commandModule({
  // NOTE: this name must exactly match the modal customId prefix
  name: `editModal`,
  type: CommandType.Modal,

  async execute(ctx) {
    // extract the event name & field from customId
    const [, name, field] = ctx.customId.match(/^editModal-(.+?)-(.+)$/)!;
    const raw = ctx.fields.getTextInputValue("value");

    // determine if this field is an array type
    const arrayFields = ["daRulez", "scoring", "pointList"];
    const value = arrayFields.includes(field)
      ? raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      : raw;

    // save to Mongo
    await eventSchema.findOneAndUpdate(
      { name, serverID: ctx.guildId! },
      { [field]: value }
    );
    

    // Ack + ephemeral confirmation (auto-deleted)
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });
    await ctx.editReply({ content: `✅ **${field}** updated.` });
    setTimeout(() => ctx.deleteReply().catch(() => {}), 5_000);
  },
});
