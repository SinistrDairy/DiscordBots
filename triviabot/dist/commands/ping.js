import { commandModule, CommandType } from "@sern/handler";
var ping_default = commandModule({
  type: CommandType.Slash,
  plugins: [],
  name: "ping",
  description: "A ping command",
  // alias : [],
  execute: async (ctx, args) => {
    await ctx.reply("Pong \u{1F3D3}");
  }
});
export {
  ping_default as default
};
