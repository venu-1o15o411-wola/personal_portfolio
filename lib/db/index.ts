import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { categories } from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

function databaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase Postgres URI (Settings → Database → URI) to .env.local.",
    );
  }
  return url;
}

const globalForDb = globalThis as unknown as {
  postgres?: ReturnType<typeof postgres>;
  drizzle?: Db;
};

function getClient() {
  if (!globalForDb.postgres) {
    globalForDb.postgres = postgres(databaseUrl(), {
      prepare: false,
      max: 1,
    });
  }
  return globalForDb.postgres;
}

function getDb(): Db {
  if (!globalForDb.drizzle) {
    globalForDb.drizzle = drizzle(getClient(), { schema });
  }
  return globalForDb.drizzle;
}

export const db = new Proxy({} as Db, {
  get(_target, prop, _receiver) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

let ready: Promise<void> | null = null;

async function init() {
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (!existing[0]) {
    const { seedTaxonomy } = await import("./seed");
    await seedTaxonomy(db);
  }
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
