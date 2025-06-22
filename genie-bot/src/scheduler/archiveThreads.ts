import cron from "node-cron";
import type { Client } from "discord.js";
import { ThreadArchive } from "../models/ThreadArchive.js";
import { connectDB, disconnectDB } from "../db.js";

export function startArchiveScheduler(client: Client) {
  client.once("ready", async () => {
    console.log("Archive scheduler starting…");

    // 1) Establish Mongo connection
    try {
      await connectDB();
      console.log("✅ MongoDB connected for scheduler");
    } catch (err) {
      console.error("❌ Failed to connect to MongoDB:", err);
      return; // abort scheduling if we can’t talk to the DB
    }

    // 2) Schedule the job
    cron.schedule("* * * * *", async () => {
      const now = new Date();

      // A) Pre-close notices
      try {
        const toNotify = await ThreadArchive.find({
          archived: false,
          endNotified: false,
          archiveAt: { $gt: now, $lte: new Date(now.getTime() + 60_000) },
        });

        for (const job of toNotify) {
          let ch;
          try {
            ch = await client.channels.fetch(job.threadId);
            if (!ch?.isThread()) throw new Error("Not a thread");
          } catch {
            console.warn(`Cleaning up stale job ${job.threadId}`);
            await ThreadArchive.deleteOne({threadId: job.threadId});
            continue;
          }

          try {
            await ch.send({
              files: [
                "https://www.emhuf.xyz/uploads/genie/1750358677651-963394123.png",
              ],
            });
            await ThreadArchive.updateOne(
              { threadId: job.threadId },
              { $set: { endNotified: true } }
            );
          } catch (err) {
            console.error(`Failed to send notice for ${job.threadId}:`, err);
          }
        }
      } catch (err) {
        console.error("Error during pre-close notifications:", err);
      }

      // B) Actual archiving
      try {
        const toArchive = await ThreadArchive.find({
          archived: false,
          archiveAt: { $lte: now },
        });

        for (const job of toArchive) {
          let ch;
          try {
            ch = await client.channels.fetch(job.threadId);
            if (!ch?.isThread()) throw new Error("Not a thread");
          } catch {
            console.warn(
              `[archiveThreads] Removing job ${job.threadId}: channel not found`
            );
            await ThreadArchive.deleteOne({threadId: job.threadId});
            continue;
          }

          try {
            await ch.setArchived(true);
            await ThreadArchive.updateOne(
              { threadId: job.threadId },
              { $set: { archived: true } }
            );
          } catch (err) {
            console.error(
              `[archiveThreads] Failed to archive ${job.threadId}:`,
              err
            );
          }
        }
      } catch (err) {
        console.error("Error during archiving step:", err);
      }
    });

    console.log("✅ Archive scheduler running every minute");
  });

  // Clean up on exit
  process.on("SIGINT", async () => {
    console.log("SIGINT received");
    await disconnectDB();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received");
    await disconnectDB();
    process.exit(0);
  });
}
