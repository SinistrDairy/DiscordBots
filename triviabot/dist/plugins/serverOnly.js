import { controller, CommandControlPlugin } from "@sern/handler";
function serverOnly(guildId, failMessage = "This command is not available in this guild. \nFor permission to use in your server, please contact my developer.") {
  return CommandControlPlugin(async (ctx, _) => {
    if (ctx.guildId == null) {
      return controller.stop();
    }
    if (!guildId.includes(ctx.guildId)) {
      ctx.reply(failMessage).then(async (m) => {
        setTimeout(async () => {
          await m.delete();
        }, 3e3);
      });
      return controller.stop();
    }
    return controller.next();
  });
}
export {
  serverOnly
};
