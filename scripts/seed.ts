import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and paste your Supabase Postgres URI.",
    );
  }

  const migrationClient = postgres(url, { max: 1 });
  await migrate(drizzle(migrationClient), {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  await migrationClient.end();

  const { ensureDb } = await import("../lib/db");
  const { seedTaxonomy } = await import("../lib/db/seed");
  const { seedSampleProjects, writeSampleAssets } = await import("../lib/db/sample-projects");
  const { db } = await import("../lib/db");
  const { ensureStorageBucket } = await import("../lib/supabase");

  writeSampleAssets();
  await ensureDb();
  await seedTaxonomy(db);
  await seedSampleProjects(db);
  try {
    await ensureStorageBucket();
    console.log("Storage bucket ready.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Storage bucket skipped:", message);
  }
  console.log("Database ready. Taxonomy and sample projects seeded.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
