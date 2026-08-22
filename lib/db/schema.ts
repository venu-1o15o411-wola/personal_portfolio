import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull(),
}).enableRLS();

export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull(),
}).enableRLS();

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  pitch: text("pitch").notNull().default(""),
  coverImageUrl: text("cover_image_url"),
  subcategoryId: integer("subcategory_id")
    .notNull()
    .references(() => subcategories.id),
  extraSubcategoryIds: jsonb("extra_subcategory_ids")
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  tags: jsonb("tags")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  techStack: jsonb("tech_stack")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  theAsk: text("the_ask").notNull().default(""),
  walkedInto: text("walked_into").notNull().default(""),
  theBuild: text("the_build").notNull().default(""),
  inTheirHands: text("in_their_hands").notNull().default(""),
  clientNote: text("client_note").notNull().default(""),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  role: text("role"),
  duration: text("duration"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  aiSummary: text("ai_summary").notNull().default(""),
  metrics: jsonb("metrics")
    .$type<{ value: string; label: string }[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const projectImages = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption").notNull().default(""),
  kind: text("kind").notNull().default("image"),
  posterUrl: text("poster_url"),
  sortOrder: integer("sort_order").notNull().default(0),
}).enableRLS();

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientName: text("client_name"),
  jobTitle: text("job_title"),
  jobDescription: text("job_description"),
  projectIds: jsonb("project_ids")
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  matchReasons: jsonb("match_reasons")
    .$type<Record<string, string>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  passwordHash: text("password_hash"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const shareViews = pgTable("share_views", {
  id: serial("id").primaryKey(),
  shareId: integer("share_id")
    .notNull()
    .references(() => shares.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  page: text("page").notNull().default("gallery"),
  pageLabel: text("page_label").notNull().default(""),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  referrer: text("referrer"),
  source: text("source").notNull().default("client"),
}).enableRLS();

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
