import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { mediaKindFrom } from "@/lib/media";
import {
  shareStatus,
  type ShareStatus,
  type ShareWithActivity,
} from "@/lib/share-status";
import { db, ensureDb } from "./index";
import {
  categories,
  projectImages,
  projects,
  shareViews,
  shares,
  subcategories,
  type Project,
  type ProjectImage,
  type Share,
  type ShareView,
} from "./schema";

export type TaxonomyTree = {
  id: number;
  code: string;
  slug: string;
  name: string;
  subcategories: { id: number; slug: string; name: string }[];
};

export type ProjectRecord = Project & {
  images: ProjectImage[];
  category: { id: number; code: string; slug: string; name: string };
  subcategory: { id: number; slug: string; name: string };
};

export async function getTaxonomy(): Promise<TaxonomyTree[]> {
  await ensureDb();
  const cats = await db.select().from(categories).orderBy(categories.sortOrder);
  const subs = await db
    .select()
    .from(subcategories)
    .orderBy(subcategories.sortOrder);
  return cats.map((cat) => ({
    ...cat,
    subcategories: subs
      .filter((sub) => sub.categoryId === cat.id)
      .map((sub) => ({ id: sub.id, slug: sub.slug, name: sub.name })),
  }));
}

async function hydrateProjects(rows: Project[]): Promise<ProjectRecord[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const [images, subs, cats] = await Promise.all([
    db
      .select()
      .from(projectImages)
      .where(inArray(projectImages.projectId, ids))
      .orderBy(projectImages.sortOrder),
    db.select().from(subcategories),
    db.select().from(categories),
  ]);

  const subMap = new Map(subs.map((item) => [item.id, item]));
  const catMap = new Map(cats.map((item) => [item.id, item]));

  return rows.map((row) => {
    const subcategory = subMap.get(row.subcategoryId);
    const category = subcategory
      ? catMap.get(subcategory.categoryId)
      : undefined;
    if (!subcategory || !category) {
      throw new Error(`Project ${row.id} is missing taxonomy`);
    }
    return {
      ...row,
      extraSubcategoryIds: row.extraSubcategoryIds ?? [],
      tags: row.tags ?? [],
      techStack: row.techStack ?? [],
      metrics: row.metrics ?? [],
      images: images.filter((image) => image.projectId === row.id),
      subcategory: {
        id: subcategory.id,
        slug: subcategory.slug,
        name: subcategory.name,
      },
      category: {
        id: category.id,
        code: category.code,
        slug: category.slug,
        name: category.name,
      },
    };
  });
}

export async function listProjects(options?: {
  search?: string;
  subcategoryId?: number;
  published?: boolean;
}) {
  await ensureDb();
  const filters = [];
  if (options?.search) {
    const term = `%${options.search}%`;
    filters.push(
      or(
        like(projects.title, term),
        like(projects.pitch, term),
        like(projects.tags, term),
        like(projects.techStack, term),
      ),
    );
  }
  if (options?.subcategoryId) {
    filters.push(eq(projects.subcategoryId, options.subcategoryId));
  }
  if (typeof options?.published === "boolean") {
    filters.push(eq(projects.published, options.published));
  }

  const rows = await db
    .select()
    .from(projects)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(projects.updatedAt));

  return hydrateProjects(rows);
}

export async function getProjectById(id: number) {
  await ensureDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  if (!rows[0]) return null;
  const [hydrated] = await hydrateProjects(rows);
  return hydrated;
}

export async function getProjectBySlug(slug: string) {
  await ensureDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  if (!rows[0]) return null;
  const [hydrated] = await hydrateProjects(rows);
  return hydrated;
}

export async function getProjectsByIds(ids: number[], publishedOnly = false) {
  if (ids.length === 0) return [];
  await ensureDb();
  const rows = await db
    .select()
    .from(projects)
    .where(
      publishedOnly
        ? and(inArray(projects.id, ids), eq(projects.published, true))
        : inArray(projects.id, ids),
    );
  const hydrated = await hydrateProjects(rows);
  const order = new Map(ids.map((id, index) => [id, index]));
  return hydrated.sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
}

export type ProjectInput = {
  slug: string;
  title: string;
  pitch: string;
  coverImageUrl?: string | null;
  subcategoryId: number;
  extraSubcategoryIds: number[];
  tags: string[];
  techStack: string[];
  theAsk: string;
  walkedInto: string;
  theBuild: string;
  inTheirHands: string;
  clientNote: string;
  liveUrl?: string | null;
  repoUrl?: string | null;
  role?: string | null;
  duration?: string | null;
  featured: boolean;
  published: boolean;
  aiSummary: string;
  metrics: { value: string; label: string }[];
  images: {
    url: string;
    caption: string;
    kind?: string;
    posterUrl?: string | null;
  }[];
};

export async function saveProject(input: ProjectInput, id?: number) {
  await ensureDb();
  const values = {
    slug: input.slug,
    title: input.title,
    pitch: input.pitch,
    coverImageUrl:
      input.coverImageUrl ||
      input.images.find(
        (image) => (image.kind || mediaKindFrom(image.url)) === "image",
      )?.url ||
      input.images[0]?.url ||
      null,
    subcategoryId: input.subcategoryId,
    extraSubcategoryIds: input.extraSubcategoryIds,
    tags: input.tags,
    techStack: input.techStack,
    theAsk: input.theAsk,
    walkedInto: input.walkedInto,
    theBuild: input.theBuild,
    inTheirHands: input.inTheirHands,
    clientNote: input.clientNote,
    liveUrl: input.liveUrl || null,
    repoUrl: input.repoUrl || null,
    role: input.role || null,
    duration: input.duration || null,
    featured: input.featured,
    published: input.published,
    aiSummary: input.aiSummary,
    metrics: input.metrics ?? [],
    updatedAt: new Date(),
  };

  let projectId = id;
  if (id) {
    await db.update(projects).set(values).where(eq(projects.id, id));
    await db.delete(projectImages).where(eq(projectImages.projectId, id));
  } else {
    const inserted = await db
      .insert(projects)
      .values(values)
      .returning({ id: projects.id });
    projectId = inserted[0].id;
  }

  if (input.images.length > 0 && projectId) {
    await db.insert(projectImages).values(
      input.images.map((image, index) => ({
        projectId,
        url: image.url,
        caption: image.caption,
        kind: image.kind || mediaKindFrom(image.url),
        posterUrl: image.posterUrl || null,
        sortOrder: index,
      })),
    );
  }

  return projectId!;
}

export async function deleteProject(id: number) {
  await deleteProjectsByIds([id]);
}

export async function deleteProjectsByIds(ids: number[]) {
  if (ids.length === 0) return;
  await ensureDb();
  const idSet = new Set(ids);

  await db.delete(projectImages).where(inArray(projectImages.projectId, ids));
  await db.delete(projects).where(inArray(projects.id, ids));

  const allShares = await db.select().from(shares);
  for (const share of allShares) {
    const nextIds = share.projectIds.filter(
      (projectId) => !idSet.has(projectId),
    );
    if (nextIds.length === share.projectIds.length) continue;
    const matchReasons = { ...share.matchReasons };
    for (const id of ids) {
      delete matchReasons[String(id)];
    }
    await db
      .update(shares)
      .set({ projectIds: nextIds, matchReasons })
      .where(eq(shares.id, share.id));
  }
}

export async function getShareByToken(token: string) {
  await ensureDb();
  const rows = await db
    .select()
    .from(shares)
    .where(eq(shares.token, token))
    .limit(1);
  return rows[0] ?? null;
}

export async function createShare(input: {
  token: string;
  clientName?: string | null;
  jobTitle?: string | null;
  jobDescription?: string | null;
  projectIds: number[];
  matchReasons: Record<string, string>;
  expiresAt?: Date | null;
  passwordHash?: string | null;
}) {
  await ensureDb();
  const inserted = await db
    .insert(shares)
    .values({
      token: input.token,
      clientName: input.clientName || null,
      jobTitle: input.jobTitle || null,
      jobDescription: input.jobDescription || null,
      projectIds: input.projectIds,
      matchReasons: input.matchReasons,
      expiresAt: input.expiresAt ?? null,
      passwordHash: input.passwordHash ?? null,
    })
    .returning();
  return inserted[0];
}

export async function revokeShare(id: number) {
  await ensureDb();
  await db
    .update(shares)
    .set({ revokedAt: new Date() })
    .where(eq(shares.id, id));
}

export async function deleteShare(id: number) {
  await ensureDb();
  await db.delete(shareViews).where(eq(shareViews.shareId, id));
  await db.delete(shares).where(eq(shares.id, id));
}

export async function insertShareView(input: {
  shareId: number;
  page: string;
  pageLabel: string;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string;
  browser: string;
  referrer: string | null;
  source?: string;
}) {
  await ensureDb();
  await db.insert(shareViews).values({
    shareId: input.shareId,
    page: input.page,
    pageLabel: input.pageLabel,
    country: input.country,
    region: input.region,
    city: input.city,
    device: input.device,
    browser: input.browser,
    referrer: input.referrer,
    source: input.source || "client",
  });
  await db
    .update(shares)
    .set({ viewCount: sql`${shares.viewCount} + 1` })
    .where(eq(shares.id, input.shareId));
}

export type { ShareStatus, ShareWithActivity };
export { shareStatus };

function attachActivity(
  shareRows: Share[],
  views: ShareView[],
): ShareWithActivity[] {
  const lastByShare = new Map<number, ShareView>();
  for (const view of views) {
    if (!lastByShare.has(view.shareId)) lastByShare.set(view.shareId, view);
  }
  return shareRows.map((share) => {
    const last = lastByShare.get(share.id);
    return {
      ...share,
      lastViewedAt: last?.viewedAt ?? null,
      lastCountry: last?.country ?? null,
      lastCity: last?.city ?? null,
      lastDevice: last?.device ?? null,
    };
  });
}

export async function listShares(): Promise<ShareWithActivity[]> {
  await ensureDb();
  const [shareRows, viewRows] = await Promise.all([
    db.select().from(shares).orderBy(desc(shares.createdAt)),
    db.select().from(shareViews).orderBy(desc(shareViews.viewedAt)).limit(800),
  ]);
  return attachActivity(shareRows, viewRows);
}

export type DashboardOverview = {
  projectCount: number;
  publishedCount: number;
  shareCount: number;
  views: number;
  viewsThisWeek: number;
  status: Record<ShareStatus, number>;
  dayCounts: { date: string; label: string; count: number }[];
  locations: {
    key: string;
    country: string | null;
    city: string | null;
    count: number;
  }[];
  devices: { device: string; count: number }[];
  recentViews: (ShareView & {
    clientName: string | null;
    jobTitle: string | null;
  })[];
  recentShares: ShareWithActivity[];
};

export async function getDashboardStats(): Promise<DashboardOverview> {
  await ensureDb();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [projectRows, publishedRows, shareRows, viewRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.published, true)),
    db.select().from(shares).orderBy(desc(shares.createdAt)),
    db.select().from(shareViews).orderBy(desc(shareViews.viewedAt)).limit(1000),
  ]);

  const status: Record<ShareStatus, number> = {
    active: 0,
    unopened: 0,
    expired: 0,
    revoked: 0,
  };
  for (const share of shareRows) {
    status[shareStatus(share)] += 1;
  }

  const dayCounts = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (13 - index));
    return {
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    };
  });
  const dayMap = new Map(dayCounts.map((day) => [day.date, day]));
  let viewsThisWeek = 0;
  const locationMap = new Map<
    string,
    { country: string | null; city: string | null; count: number }
  >();
  const deviceMap = new Map<string, number>();

  for (const view of viewRows) {
    const at =
      view.viewedAt instanceof Date ? view.viewedAt : new Date(view.viewedAt);
    if (at >= weekAgo) viewsThisWeek += 1;
    const key = at.toISOString().slice(0, 10);
    const day = dayMap.get(key);
    if (day) day.count += 1;
    const locKey = `${view.city || ""}|${view.country || "unknown"}`;
    const loc = locationMap.get(locKey) || {
      country: view.country,
      city: view.city,
      count: 0,
    };
    loc.count += 1;
    locationMap.set(locKey, loc);
    const device = view.device || "desktop";
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
  }

  const shareById = new Map(shareRows.map((share) => [share.id, share]));
  const recentViews = viewRows.slice(0, 12).map((view) => {
    const share = shareById.get(view.shareId);
    return {
      ...view,
      clientName: share?.clientName ?? null,
      jobTitle: share?.jobTitle ?? null,
    };
  });

  return {
    projectCount: Number(projectRows[0]?.count ?? 0),
    publishedCount: Number(publishedRows[0]?.count ?? 0),
    shareCount: shareRows.length,
    views: shareRows.reduce((sum, share) => sum + (share.viewCount || 0), 0),
    viewsThisWeek,
    status,
    dayCounts,
    locations: [...locationMap.entries()]
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    devices: [...deviceMap.entries()]
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count),
    recentViews,
    recentShares: attachActivity(shareRows.slice(0, 8), viewRows),
  };
}
