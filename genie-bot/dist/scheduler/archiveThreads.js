import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
function startArchiveScheduler(client) {
  client.once("ready", () => {
    console.log("Archive scheduler running");
    cron.schedule("* * * * *", async () => {
      const now = /* @__PURE__ */ new Date();
      const toNotify = await prisma.threadArchive.findMany({
        where: {
          archived: false,
          endNotified: false,
          archiveAt: {
            gt: now,
            lte: new Date(now.getTime() + 6e4)
          }
        }
      });
      for (const job of toNotify) {
        let ch;
        try {
          ch = await client.channels.fetch(job.threadId);
          if (!ch?.isThread())
            throw new Error("Not a thread");
        } catch {
          console.warn(`Cleaning up stale job ${job.id}`);
          await prisma.threadArchive.delete({ where: { id: job.id } });
          continue;
        }
        try {
          await ch.send({
            files: [
              "https://www.emhuf.xyz/uploads/Quest_Posts/1749663293918-584663827.png"
            ]
          });
          await prisma.threadArchive.update({
            where: { id: job.id },
            data: { endNotified: true }
          });
        } catch (err) {
          console.error(`Failed to send notice for ${job.threadId}:`, err);
        }
      }
      const toArchive = await prisma.threadArchive.findMany({
        where: { archived: false, archiveAt: { lte: now } }
      });
      for (const job of toArchive) {
        let ch;
        try {
          ch = await client.channels.fetch(job.threadId);
          if (!ch?.isThread())
            throw new Error("Not a thread");
        } catch (fetchErr) {
          console.warn(
            `[archiveThreads] Thread ${job.threadId} not found or not a thread\u2014removing job ${job.id}`
          );
          await prisma.threadArchive.delete({ where: { id: job.id } });
          continue;
        }
        try {
          await ch.setArchived(true);
          await prisma.threadArchive.update({
            where: { id: job.id },
            data: { archived: true }
          });
        } catch (sendErr) {
          console.error(
            `[archiveThreads] Failed to archive thread ${job.threadId}:`,
            sendErr
          );
        }
      }
    });
  });
  process.on("SIGINT", () => prisma.$disconnect());
  process.on("SIGTERM", () => prisma.$disconnect());
}
export {
  startArchiveScheduler
};
