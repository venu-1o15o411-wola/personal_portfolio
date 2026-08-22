import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { categories } from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

function databaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase Session pooler URI (port 5432) to .env.local.",
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
      idle_timeout: 20,
      connect_timeout: 8,
      ssl: "require",
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

function resetClient() {
  const client = globalForDb.postgres;
  globalForDb.postgres = undefined;
  globalForDb.drizzle = undefined;
  void client?.end({ timeout: 1 }).catch(() => undefined);
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

let ready: Promise<void> | null = null;

function wrapDbError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message)) {
    return new Error(
      "Cannot reach Supabase. DATABASE_URL must use the Session pooler (*.pooler.supabase.com, port 5432), not db.PROJECT.supabase.co.",
    );
  }
  if (/timeout|CONNECT_TIMEOUT/i.test(message)) {
    return new Error(
      "Supabase connection timed out. Use Session pooler port 5432 in DATABASE_URL and restart npm run dev.",
    );
  }
  if (/28P01|password authentication failed/i.test(message)) {
    return new Error(
      "Supabase rejected the database password. Reset it in Project Settings → Database and paste the Session pooler URI (encode ! as %21).",
    );
  }
  if (/relation .+ does not exist/i.test(message)) {
    return new Error("Database tables are missing. Run npm run db:seed.");
  }
  return error instanceof Error ? error : new Error(message);
}

async function init() {
  try {
    const existing = await db.select({ id: categories.id }).from(categories).limit(1);
    if (!existing[0]) {
      const { seedTaxonomy } = await import("./seed");
      await seedTaxonomy(db);
    }
  } catch (error) {
    resetClient();
    throw wrapDbError(error);
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
