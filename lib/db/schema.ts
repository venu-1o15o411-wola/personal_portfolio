import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const subcategories = sqliteTable("subcategories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  pitch: text("pitch").notNull().default(""),
  coverImageUrl: text("cover_image_url"),
  subcategoryId: integer("subcategory_id")
    .notNull()
    .references(() => subcategories.id),
  extraSubcategoryIds: text("extra_subcategory_ids", { mode: "json" })
    .$type<number[]>()
    .notNull()
    .$defaultFn(() => []),
  tags: text("tags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  techStack: text("tech_stack", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  theAsk: text("the_ask").notNull().default(""),
  walkedInto: text("walked_into").notNull().default(""),
  theBuild: text("the_build").notNull().default(""),
  inTheirHands: text("in_their_hands").notNull().default(""),
  clientNote: text("client_note").notNull().default(""),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  role: text("role"),
  duration: text("duration"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  aiSummary: text("ai_summary").notNull().default(""),
  metrics: text("metrics", { mode: "json" })
    .$type<{ value: string; label: string }[]>()
    .notNull()
    .$defaultFn(() => []),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projectImages = sqliteTable("project_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  url: text("url").notNull(),
  caption: text("caption").notNull().default(""),
  kind: text("kind").notNull().default("image"),
  posterUrl: text("poster_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const shares = sqliteTable("shares", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  clientName: text("client_name"),
  jobTitle: text("job_title"),
  jobDescription: text("job_description"),
  projectIds: text("project_ids", { mode: "json" })
    .$type<number[]>()
    .notNull()
    .$defaultFn(() => []),
  matchReasons: text("match_reasons", { mode: "json" })
    .$type<Record<string, string>>()
    .notNull()
    .$defaultFn(() => ({})),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  passwordHash: text("password_hash"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const shareViews = sqliteTable("share_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shareId: integer("share_id")
    .notNull()
    .references(() => shares.id),
  viewedAt: integer("viewed_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  page: text("page").notNull().default("gallery"),
  pageLabel: text("page_label").notNull().default(""),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  referrer: text("referrer"),
  source: text("source").notNull().default("client"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  subcategory: one(subcategories, {
    fields: [projects.subcategoryId],
    references: [subcategories.id],
  }),
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const sharesRelations = relations(shares, ({ many }) => ({
  views: many(shareViews),
}));

export const shareViewsRelations = relations(shareViews, ({ one }) => ({
  share: one(shares, {
    fields: [shareViews.shareId],
    references: [shares.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectImage = typeof projectImages.$inferSelect;
export type Share = typeof shares.$inferSelect;
export type ShareView = typeof shareViews.$inferSelect;
