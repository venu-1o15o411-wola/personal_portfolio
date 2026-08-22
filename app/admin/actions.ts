"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearAdminSession,
  createAdminSession,
  requireAdmin,
  verifyAdminPassword,
} from "@/lib/auth";
import { generateAiSummary, matchJobToProjects } from "@/lib/match";
import {
  createShare,
  deleteProjectsByIds,
  deleteShare,
  listProjects,
  revokeShare,
  saveProject,
  type ProjectInput,
} from "@/lib/db/queries";
import { hashSecret } from "@/lib/crypto";
import { slugify } from "@/lib/format";
import { nanoid } from "nanoid";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  pitch: z.string().default(""),
  coverImageUrl: z.string().optional().nullable(),
  subcategoryId: z.coerce.number(),
  extraSubcategoryIds: z.array(z.number()).default([]),
  tags: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  theAsk: z.string().default(""),
  walkedInto: z.string().default(""),
  theBuild: z.string().default(""),
  inTheirHands: z.string().default(""),
  clientNote: z.string().default(""),
  liveUrl: z.string().optional().nullable(),
  repoUrl: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  metrics: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .default([]),
  images: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string(),
        kind: z.string().optional(),
        posterUrl: z.string().optional().nullable(),
      }),
    )
    .default([]),
});

export async function saveProjectAction(payload: unknown) {
  await requireAdmin();
  const parsed = projectSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid case study" };
  }
  try {
    const slug = slugify(parsed.data.slug || parsed.data.title);
    const aiSummary = await generateAiSummary({
      title: parsed.data.title,
      pitch: parsed.data.pitch,
      stack: parsed.data.techStack,
      theAsk: parsed.data.theAsk,
      walkedInto: parsed.data.walkedInto,
      theBuild: parsed.data.theBuild,
      inTheirHands: parsed.data.inTheirHands,
    });

    const input: ProjectInput = {
      ...parsed.data,
      slug,
      coverImageUrl: parsed.data.coverImageUrl || null,
      liveUrl: parsed.data.liveUrl || null,
      repoUrl: parsed.data.repoUrl || null,
      role: parsed.data.role || null,
      duration: parsed.data.duration || null,
      aiSummary,
      metrics: parsed.data.metrics ?? [],
    };

    const id = parsed.data.id ? Number(parsed.data.id) : undefined;
    const savedId = await saveProject(input, id);
    return { id: savedId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save project";
    return { error: message };
  }
}

export async function deleteProjectAction(id: number) {
  await requireAdmin();
  await deleteProjectsByIds([id]);
  return { ok: true as const };
}

export async function deleteProjectsAction(ids: number[]) {
  await requireAdmin();
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))];
  await deleteProjectsByIds(unique);
  return { ok: true as const, count: unique.length };
}

export async function matchJobAction(jobDescription: string) {
  await requireAdmin();
  const projects = await listProjects({ published: true });
  return matchJobToProjects(jobDescription, projects);
}

const shareSchema = z.object({
  clientName: z.string().optional(),
  jobTitle: z.string().optional(),
  jobDescription: z.string().optional(),
  projectIds: z.array(z.number()).min(1),
  matchReasons: z.record(z.string(), z.string()).optional(),
  expiresAt: z.string().optional().nullable(),
  password: z.string().optional(),
});

export async function createShareAction(payload: unknown) {
  await requireAdmin();
  const parsed = shareSchema.parse(payload);
  const token = nanoid(16);
  const share = await createShare({
    token,
    clientName: parsed.clientName,
    jobTitle: parsed.jobTitle,
    jobDescription: parsed.jobDescription,
    projectIds: parsed.projectIds,
    matchReasons: parsed.matchReasons ?? {},
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    passwordHash: parsed.password ? hashSecret(parsed.password) : null,
  });
  return { token: share.token };
}

export async function revokeShareAction(id: number) {
  await requireAdmin();
  await revokeShare(id);
}

export async function deleteShareAction(id: number) {
  await requireAdmin();
  await deleteShare(id);
  return { ok: true as const };
}
