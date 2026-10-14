import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    // Attempt standard connection first with 3s timeout
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(
        `✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`,
      );
      return;
    } catch (localErr) {
      console.warn(
        `⚠️ Standard MongoDB connection failed (${localErr.message}).`,
      );
      console.log(
        "🔄 Initializing in-memory MongoDB fallback instance for seamless local development...",
      );

      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(
        `✅ MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`,
      );
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
