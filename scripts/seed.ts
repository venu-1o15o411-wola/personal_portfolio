import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const { ensureDb } = await import("../lib/db");
  const { writeSampleAssets } = await import("../lib/db/sample-projects");
  writeSampleAssets();
  await ensureDb();
  console.log("Database ready. Taxonomy and 5 sample projects seeded.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
