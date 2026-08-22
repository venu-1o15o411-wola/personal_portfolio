import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";

export const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const db = drizzle(client, { schema });

let ready: Promise<void> | null = null;

async function init() {
  const { seedTaxonomy } = await import("./seed");
  const { seedSampleProjects } = await import("./sample-projects");
  await client.execute("PRAGMA foreign_keys = ON");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedTaxonomy(db);
  await seedSampleProjects(db);
}

export function ensureDb() {
  if (!ready) {
    ready = init().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
