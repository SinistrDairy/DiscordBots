import { CommandControlPlugin, controller } from "@sern/handler";
function payload(resp) {
  return {
    fetchReply: true,
    content: resp,
    allowedMentions: { repliedUser: false },
    ephemeral: true
  };
}
function requirePermission(target, perm, response) {
  return CommandControlPlugin(async (ctx, args) => {
    if (ctx.guild === null) {
      ctx.reply(payload("This command cannot be used here"));
      console.warn(
        "PermCheck > A command stopped because we couldn't check a users permissions (was used in dms)"
      );
      return controller.stop();
    }
    const bot = await ctx.guild.members.fetchMe({
      cache: false
    });
    const memm = ctx.member;
    switch (target) {
      case "bot":
        if (!bot.permissions.has(perm)) {
          if (!response)
            response = `I cannot use this command, please give me \`${perm.join(
              ", "
            )}\` permission(s).`;
          await ctx.reply(payload(response));
          return controller.stop();
        }
        return controller.next();
      case "user":
        if (!memm.permissions.has(perm)) {
          if (!response)
            response = `You cannot use this command because you are missing \`${perm.join(
              ", "
            )}\` permission(s).`;
          await ctx.reply(payload(response));
          return controller.stop();
        }
        return controller.next();
      case "both":
        if (!bot.permissions.has(perm) || !memm.permissions.has(perm)) {
          if (!response)
            response = `Please ensure <@${bot.user.id}> and <@${memm.user.id}> both have \`${perm.join(", ")}\` permission(s).`;
          await ctx.reply(payload(response));
          return controller.stop();
        }
        return controller.next();
    }
  });
}
export {
  requirePermission
};
