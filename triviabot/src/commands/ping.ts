import { commandModule, CommandType } from "@sern/handler";

export default commandModule({
  type: CommandType.Slash,
  plugins: [],
  name: "ping",
  description: "A ping command",
  // alias : [],
  execute: async (ctx, args) => {
    await ctx.reply("Pong 🏓");
  },
});
