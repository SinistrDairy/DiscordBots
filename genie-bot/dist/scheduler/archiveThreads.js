import cron from "node-cron";
import { ThreadArchive } from "../models/ThreadArchive.js";
import { connectDB, disconnectDB } from "../db.js";
function startArchiveScheduler(client) {
  client.once("ready", async () => {
    console.log("Archive scheduler starting\u2026");
    try {
      await connectDB();
      console.log("\u2705 MongoDB connected for scheduler");
    } catch (err) {
      console.error("\u274C Failed to connect to MongoDB:", err);
      return;
    }
    cron.schedule("* * * * *", async () => {
      const now = /* @__PURE__ */ new Date();
      try {
        const toNotify = await ThreadArchive.find({
          archived: false,
          endNotified: false,
          archiveAt: { $gt: now, $lte: new Date(now.getTime() + 6e4) }
        });
        for (const job of toNotify) {
          let ch;
          try {
            ch = await client.channels.fetch(job.threadId);
            if (!ch?.isThread())
              throw new Error("Not a thread");
          } catch {
            console.warn(`Cleaning up stale job ${job.id}`);
            await ThreadArchive.deleteOne({ id: job.id });
            continue;
          }
          try {
            await ch.send({
              files: [
                "https://www.emhuf.xyz/uploads/genie/1750358677651-963394123.png"
              ]
            });
            await ThreadArchive.updateOne(
              { id: job.id },
              { $set: { endNotified: true } }
            );
          } catch (err) {
            console.error(`Failed to send notice for ${job.threadId}:`, err);
          }
        }
      } catch (err) {
        console.error("Error during pre-close notifications:", err);
      }
      try {
        const toArchive = await ThreadArchive.find({
          archived: false,
          archiveAt: { $lte: now }
        });
        for (const job of toArchive) {
          let ch;
          try {
            ch = await client.channels.fetch(job.threadId);
            if (!ch?.isThread())
              throw new Error("Not a thread");
          } catch {
            console.warn(
              `[archiveThreads] Removing job ${job.id}: channel not found`
            );
            await ThreadArchive.deleteOne({ id: job.id });
            continue;
          }
          try {
            await ch.setArchived(true);
            await ThreadArchive.updateOne(
              { id: job.id },
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
    console.log("\u2705 Archive scheduler running every minute");
  });
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
export {
  startArchiveScheduler
};
