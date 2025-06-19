// src/db.ts
import mongoose from "mongoose";

export async function connectDB() {
  await mongoose.connect(process.env.DATABASE_URL!, {
    // useNewUrlParser, useUnifiedTopology are defaults in Mongoose 6+
  });
  console.log("✅ MongoDB connected");
}
export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("✅ MongoDB disconnected");
}