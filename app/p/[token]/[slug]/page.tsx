import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CaseStudyView } from "@/components/client/CaseStudyView";
import { SharePasswordGate } from "@/components/client/SharePasswordGate";
import { verifyShareAccess } from "@/lib/auth";
import { getProjectsByIds, getShareByToken } from "@/lib/db/queries";
import { isExpired } from "@/lib/format";
import { mediaKindFrom } from "@/lib/media";
import { getProfile } from "@/lib/profile";
import { trackShareView } from "@/lib/track";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string; slug: string }>;
}): Promise<Metadata> {
  const { token, slug } = await params;
  const share = await getShareByToken(token);
  if (!share) return { title: "Not found" };
  const projects = await getProjectsByIds(share.projectIds);
  const project = projects.find((item) => item.slug === slug);
  return { title: project?.title ?? "Case study" };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ token: string; slug: string }>;
}) {
  const { token, slug } = await params;
  const share = await getShareByToken(token);
  if (!share || share.revokedAt || isExpired(share.expiresAt)) {
    notFound();
  }
  if (share.passwordHash && !(await verifyShareAccess(token))) {
    return <SharePasswordGate token={token} />;
  }

  const projects = await getProjectsByIds(share.projectIds);
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  await trackShareView(share.id, "case", project.title);

  const index = projects.findIndex((item) => item.id === project.id);
  const previous = projects[index - 1];
  const next = projects[index + 1];
  const profile = getProfile();

  return (
    <CaseStudyView
      token={token}
      profileName={profile.name}
      title={project.title}
      pitch={project.pitch}
      coverImageUrl={project.coverImageUrl}
      category={project.category.name}
      subcategory={project.subcategory.name}
      role={project.role}
      duration={project.duration}
      liveUrl={project.liveUrl}
      theAsk={project.theAsk}
      walkedInto={project.walkedInto}
      theBuild={project.theBuild}
      inTheirHands={project.inTheirHands}
      clientNote={project.clientNote}
      techStack={project.techStack}
      metrics={project.metrics ?? []}
      reason={share.matchReasons[String(project.id)] || null}
      media={project.images.map((image) => ({
        url: image.url,
        caption: image.caption,
        kind: (image.kind as "image" | "video") || mediaKindFrom(image.url),
        posterUrl: image.posterUrl,
      }))}
      previous={
        previous
          ? {
              slug: previous.slug,
              title: previous.title,
              coverImageUrl: previous.coverImageUrl,
            }
          : null
      }
      next={
        next
          ? {
              slug: next.slug,
              title: next.title,
              coverImageUrl: next.coverImageUrl,
            }
          : null
      }
    />
  );
}
