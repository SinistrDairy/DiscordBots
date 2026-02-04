import { commandModule, CommandType } from "@sern/handler";
import { publishConfig } from "@sern/publisher";
import { PermissionFlagsBits, MessageFlags } from "discord.js";
import { runBirthdayAnnouncer } from "../../../utils/Birthday/birthday-announcer.js";

const GUILD_ID2 = process.env.GUILD_ID2!;

function ts() {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const YYYY = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}`;
}

export default commandModule({
  name: "birthday-run",
  description: "ADMIN: Force the birthday announcer to run right now",
  type: CommandType.Slash,

  plugins: [
    publishConfig({
      guildIds: [GUILD_ID2],
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
    }),
  ],

  execute: async (ctx) => {
    if (!ctx.guildId || ctx.guildId !== GUILD_ID2) {
      return ctx.reply({
        content: "This command is only usable in the main guild.",
        flags: MessageFlags.Ephemeral,
      });
    }

    let birthdayJobRunning = false;

    try {
      if (birthdayJobRunning) {
        return;
      } else {
        birthdayJobRunning = true;
        await ctx.reply({
          content: "Running birthday scan now...",
          flags: MessageFlags.Ephemeral,
        });
      }
      const start = Date.now();
      console.log(`${ts()} -> [birthday] running daily announcer`);
      const res = await runBirthdayAnnouncer(ctx.client);

      const elapsed = Date.now() - start;
      console.log(
        `${ts()} -> [birthday] announcer finished in ${(elapsed / 1000).toFixed(2)}s`,
        `\nBirthdays Found: ${res.birthdaysFound}`,
      );

      // be defensive about whatever shape you return
      const postedCount = res.posted;
      const birthdayCount = res.birthdaysFound;
      const extra =
        `${ts()} -> Birthday scan finished in ${(elapsed / 1000).toFixed(2)}s\n` +
        (!birthdayCount !== undefined
          ? `Birthdays detected: **${birthdayCount}**\nPosted: **${postedCount}**`
          : `Posted: **${postedCount}**`);

      return ctx.interaction.editReply(
        `${ts()} -> ✅ Birthday scan complete.\n${extra}`,
      );
    } catch (err) {
      console.error("birthday-run error:", err);
      return ctx.interaction.editReply(
        "❌ Birthday scan failed. Check the console logs.",
      );
    }
  },
});
