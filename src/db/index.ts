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

// Neon hands out two hosts. The pooled one (…-pooler…) runs PgBouncer in transaction
// mode, which cannot keep prepared statements alive across a connection, so postgres.js
// has to stop preparing. It is also the host to use on serverless, where many short
// lived instances would otherwise exhaust the database's connection limit.
const isPooled = connectionString.includes("-pooler.");

const pool =
  globalForDb.pool ??
  postgres(connectionString, {
    max: isPooled ? 5 : 10,
    prepare: !isPooled,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
