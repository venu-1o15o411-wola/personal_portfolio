import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

config({ path: ".env.local" });
config({ path: ".env" });

function connectionHint(url: string, error: unknown) {
  const host = (() => {
    try {
      return new URL(url.replace(/^postgresql:/, "http:")).hostname;
    } catch {
      return "";
    }
  })();
  const message = error instanceof Error ? error.message : String(error);
  const dnsMiss = /ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message);

  if (host.startsWith("db.") && host.endsWith(".supabase.co")) {
    return `DATABASE_URL is the direct host (${host}), which is IPv6-only and often fails locally with ENOTFOUND.
In Supabase: Project → Connect → ORMs → URI.
Copy the Session pooler URI (host like aws-0-REGION.pooler.supabase.com, port 5432, user postgres.PROJECT_REF).
Do not use db.PROJECT.supabase.co. If the password has !, @, or #, URL-encode it.`;
  }
  if (dnsMiss) {
    return `Could not resolve ${host || "the database host"}. Use the Session pooler URI from Supabase → Connect, not the Direct connection.`;
  }
  if (/28P01|password authentication failed/i.test(message)) {
    return `Postgres rejected the password for this URI.
Use the database password from Supabase → Project Settings → Database (or reset it there).
In DATABASE_URL, encode special characters: ! → %21  @ → %40  # → %23
Keep the pooler user as postgres.PROJECT_REF. For db:seed, use Session pooler port 5432 (not 6543).`;
  }
  return null;
}

async function main() {
  const url = (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and paste your Supabase Postgres URI.",
    );
  }

  const migrationClient = postgres(url, { max: 1, prepare: false, connect_timeout: 15 });
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
  } catch (error) {
    const hint = connectionHint(url, error);
    if (hint) {
      console.error(hint);
    }
    throw error;
  } finally {
    await migrationClient.end({ timeout: 1 }).catch(() => undefined);
  }

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
