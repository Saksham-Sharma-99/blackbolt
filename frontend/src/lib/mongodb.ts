import { MongoClient } from "mongodb";

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export default function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // During build, MONGODB_URI may not be set. Return a deferred promise
    // that will reject only when actually awaited at request time.
    const p = new Promise<MongoClient>((_, reject) => {
      // Use queueMicrotask to avoid unhandled rejection during module load
      queueMicrotask(() => reject(new Error("MONGODB_URI is not configured")));
    });
    // Prevent unhandled rejection warning during build
    p.catch(() => {});
    return p;
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}
