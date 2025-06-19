// src/scheduler/archiveThreads.ts
import cron from "node-cron";
import * as Prisma from "@prisma/client";
const { PrismaClient } = Prisma;
import type { Client } from "discord.js";

const prisma = new PrismaClient();

export function startArchiveScheduler(client: Client) {
  client.once("ready", () => {
    console.log("Archive scheduler running");

    cron.schedule("* * * * *", async () => {
      const now = new Date();

      // 1) Pre-close notices
      const toNotify = await prisma.threadArchive.findMany({
        where: {
          archived: false,
          endNotified: false,
          archiveAt: {
            gt: now,
            lte: new Date(now.getTime() + 60_000),
          },
        },
      });

      for (const job of toNotify) {
        let ch;
        try {
          ch = await client.channels.fetch(job.threadId);
          if (!ch?.isThread()) throw new Error("Not a thread");
        } catch {
          console.warn(`Cleaning up stale job ${job.id}`);
          await prisma.threadArchive.delete({ where: { id: job.id } });
          continue;
        }

        try {
          await ch.send({
            files: [
              "https://www.emhuf.xyz/uploads/Quest_Posts/1749663293918-584663827.png",
            ],
          });
          await prisma.threadArchive.update({
            where: { id: job.id },
            data: { endNotified: true },
          });
        } catch (err) {
          console.error(`Failed to send notice for ${job.threadId}:`, err);
        }
      }

      // 2) Actual archiving
      const toArchive = await prisma.threadArchive.findMany({
        where: { archived: false, archiveAt: { lte: now } },
      });

      for (const job of toArchive) {
        let ch;
        // 1) Try fetching, bail & delete on Unknown Channel
        try {
          ch = await client.channels.fetch(job.threadId);
          if (!ch?.isThread()) throw new Error("Not a thread");
        } catch (fetchErr: any) {
          console.warn(
            `[archiveThreads] Thread ${job.threadId} not found or not a thread—removing job ${job.id}`
          );
          await prisma.threadArchive.delete({ where: { id: job.id } });
          continue;
        }

        // 2) Archive it and mark as archived
        try {
          await ch.setArchived(true);
          await prisma.threadArchive.update({
            where: { id: job.id },
            data: { archived: true },
          });
        } catch (sendErr) {
          console.error(
            `[archiveThreads] Failed to archive thread ${job.threadId}:`,
            sendErr
          );
          // Optionally you could also clean up here if you never want to retry
        }
      }
    });
  });

  // clean up Prisma on shutdown
  process.on("SIGINT", () => prisma.$disconnect());
  process.on("SIGTERM", () => prisma.$disconnect());
}
