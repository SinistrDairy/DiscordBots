import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing from .env");

  // Optional: avoid dev warning spam / tune behavior
  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("✅ Mongo connected");

  return mongoose;
}