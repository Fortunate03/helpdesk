import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and start Postgres with `docker compose up -d`.");
}

// Every hot reload in development re-evaluates this module, which would leave the
// previous connection pool open. Caching on globalThis keeps a single pool alive.
const globalForDb = globalThis as unknown as { pool?: ReturnType<typeof postgres> };

const pool = globalForDb.pool ?? postgres(connectionString, { max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
