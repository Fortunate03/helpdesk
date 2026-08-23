import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env, then run `docker compose up -d`.");
  }

  // A single connection: migrations must be applied in order, never concurrently.
  const pool = postgres(connectionString, { max: 1 });

  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.end();

  console.log("Migrations applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
