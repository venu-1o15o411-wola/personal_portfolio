import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { TAXONOMY } from "./taxonomy";

export async function seedTaxonomy(db: LibSQLDatabase<typeof schema>) {
  for (const [index, category] of TAXONOMY.entries()) {
    const existing = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, category.slug))
      .limit(1);

    let categoryId = existing[0]?.id;
    if (!categoryId) {
      const inserted = await db
        .insert(schema.categories)
        .values({
          code: category.code,
          slug: category.slug,
          name: category.name,
          sortOrder: index,
        })
        .returning({ id: schema.categories.id });
      categoryId = inserted[0].id;
    } else {
      await db
        .update(schema.categories)
        .set({
          code: category.code,
          name: category.name,
          sortOrder: index,
        })
        .where(eq(schema.categories.id, categoryId));
    }

    for (const [subIndex, sub] of category.subcategories.entries()) {
      const existingSub = await db
        .select()
        .from(schema.subcategories)
        .where(eq(schema.subcategories.slug, sub.slug))
        .limit(1);

      if (!existingSub[0]) {
        await db.insert(schema.subcategories).values({
          categoryId,
          slug: sub.slug,
          name: sub.name,
          sortOrder: subIndex,
        });
      } else {
        await db
          .update(schema.subcategories)
          .set({
            categoryId,
            name: sub.name,
            sortOrder: subIndex,
          })
          .where(eq(schema.subcategories.id, existingSub[0].id));
      }
    }
  }
}
