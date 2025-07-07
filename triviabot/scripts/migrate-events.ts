#!/usr/bin/env ts-node
// scripts/migrate-events-and-scoring.ts
import "dotenv/config";
import mongoose from "mongoose";
import EventModel, { Event as EventType } from "../src/models/profiles/event-schema.js";

const DEFAULT_RULES_EMOJI = "<:fk_arrow_p:1333840032590594058>";

// Matches *any* Discord‐style emoji tag globally
const EMOJI_TAG_GLOBAL_RE = /<:[^>]+>/g;
// Matches your Markdown bold+underline numeric pattern, e.g. **__100__**
const POINTS_MARKDOWN_RE = /\*\*__\d+__\*\*/g;

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Please set MONGO_URI in your environment and try again.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("🔌 Connected to MongoDB.");

  const events = await EventModel.find().exec();
  console.log(`⚙️  Found ${events.length} event(s).`);

  let migratedCount = 0;
  for (const raw of events) {
    // Bypass TS/Mongoose strict mode so we can read legacy fields
    const docAny = raw as unknown as Record<string, any>;

    // Build our Mongo update operators
    type Ops = {
      $set?: Partial<EventType> & { rEmojiID?: string };
      $unset?: Record<string, string>;
    };
    const ops: Ops = {};
    let needsUpdate = false;

    // 1) Migrate legacy emojiID → eEmojiID, set default rEmojiID, then unset emojiID
    const oldEmoji: string | undefined = docAny.emojiID;
    if (oldEmoji) {
      ops.$set = {
        ...(ops.$set ?? {}),
        eEmojiID: oldEmoji,
        rEmojiID: DEFAULT_RULES_EMOJI,
      };
      ops.$unset = { ...(ops.$unset ?? {}), emojiID: "" };
      needsUpdate = true;
    }

    // 2) Clean scoring[]: remove all <:…> tags and Markdown point marks
    if (Array.isArray(docAny.scoring)) {
      const cleanedScoring = docAny.scoring.map((line: string) =>
        line
          .replace(EMOJI_TAG_GLOBAL_RE, "")
          .replace(POINTS_MARKDOWN_RE, "")
          .trim()
      );
      const changed =
        cleanedScoring.length !== docAny.scoring.length ||
        cleanedScoring.some((s, i) => s !== docAny.scoring[i]);
      if (changed) {
        ops.$set = { ...(ops.$set ?? {}), scoring: cleanedScoring };
        needsUpdate = true;
      }
    }

    // 3) Strip *all* <:…> tags from titles as before
    if (typeof docAny.title === "string") {
      const strippedTitle = docAny.title
        .replace(EMOJI_TAG_GLOBAL_RE, "")
        .trim();
      if (strippedTitle !== docAny.title.trim()) {
        ops.$set = { ...(ops.$set ?? {}), title: strippedTitle };
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      // Use raw collection so Mongoose doesn’t drop our $unset
      await EventModel.collection.updateOne({ _id: docAny._id }, ops);
      console.log(`✅ Migrated & cleaned "${docAny.name}"`);
      migratedCount++;
    }
  }

  console.log(`\n🎉 Migration complete. Updated ${migratedCount} document(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("🔥 Migration failed:", err);
  process.exit(1);
});
