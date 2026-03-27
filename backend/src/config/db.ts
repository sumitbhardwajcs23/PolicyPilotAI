import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ServerApiVersion } from 'mongodb';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED — bypass local ISP/Network DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Drop stale non-sparse indexes before Mongoose recreates them as sparse
const migrateIndexes = async () => {
  try {
    const db = mongoose.connection.db
    if (!db) return
    const col = db.collection('users')
    const indexes = await col.indexes()
    const toDrop = ['mobile_1', 'email_1']
    for (const idx of toDrop) {
      const exists = indexes.some((i: any) => i.name === idx && !i.sparse)
      if (exists) {
        await col.dropIndex(idx)
        console.log(`[DB] Dropped old index: ${idx}`)
      }
    }
    // Recreate via Mongoose ensureIndexes
    await mongoose.model('User').syncIndexes()
    console.log('[DB] Indexes synced ✓')
  } catch (err: any) {
    // Non-fatal — index may not exist
    console.warn(`[DB] Index migration warning: ${err.message}`)
  }
}

export const connectDB = async () => {
  const atlasUri = process.env.DATABASE_URL || '';
  const localUri = process.env.LOCAL_DATABASE_URL || 'mongodb://127.0.0.1:27017/policypilot';
  const allowFallback = process.env.MONGO_FALLBACK === 'true';

  mongoose.set('strictQuery', true);

  // 1. Try Atlas (Primary)
  if (atlasUri) {
    try {
      console.log('[DB] Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(atlasUri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      console.log(`[DB] Connected to Atlas: ${conn.connection.host}`);
      await migrateIndexes();
      return;
    } catch (err: any) {
      console.warn(`[DB] Atlas connection failed: ${err.message}`);
    }
  }

  // 2. Try Local MongoDB (Secondary)
  try {
    console.log('[DB] Attempting Local MongoDB connection...');
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[DB] Connected to Local MongoDB: ${conn.connection.host}`);
    await migrateIndexes();
    return;
  } catch (err: any) {
    console.warn(`[DB] Local MongoDB failed: ${err.message}`);
  }

  // 3. Try In-Memory Fallback (Tertiary)
  if (allowFallback) {
    try {
      console.warn('[DB] Using In-Memory MongoDB (VOLATILE! Data will be lost on restart)');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[DB] Connected to In-Memory: ${conn.connection.host}`);
      return;
    } catch (memErr: any) {
      console.error(`[DB] Fatal: In-memory fallback failed: ${memErr.message}`);
      process.exit(1);
    }
  }

  console.error('[DB] All connection attempts failed and fallback is disabled.');
  process.exit(1);
};
