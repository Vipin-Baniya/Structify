import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Extend global to cache connection across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function connectDB() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      console.log("Connecting to MongoDB...");
      cached.promise = mongoose.connect(MONGODB_URI, {
        dbName: "structify",
        bufferCommands: false,
      });
    }

    cached.conn = await cached.promise;

    console.log("MongoDB connected ✅");

    return cached.conn;
  } catch (e) {
    console.error("MongoDB ERROR ❌", e);
    throw e;
  }
}
