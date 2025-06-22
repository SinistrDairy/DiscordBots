import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import eventsSchema from "../../models/profiles/event-schema.js";

export const deleteOptions = [
  { name: "name", type: ApplicationCommandOptionType.String, description: "Unique name of the event", required: true },
];

export async function handleDelete(ctx: any) {
  const name = ctx.options.getString("name", true);
  await eventsSchema.findOneAndDelete({ name, serverID: ctx.guildId! });
  return ctx.reply({ content: `✅ Deleted event \`${name}\`.`, flags: MessageFlags.Ephemeral });
}
