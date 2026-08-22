import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareGallery } from "@/components/client/ShareGallery";
import { SharePasswordGate } from "@/components/client/SharePasswordGate";
import { verifyShareAccess } from "@/lib/auth";
import { getProjectsByIds, getShareByToken } from "@/lib/db/queries";
import { isExpired } from "@/lib/format";
import { getProfile } from "@/lib/profile";
import { trackShareView } from "@/lib/track";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const share = await getShareByToken(token);
  const profile = getProfile();
  return {
    title: share?.jobTitle || `${profile.name} · Selected work`,
  };
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const share = await getShareByToken(token);
  if (!share || share.revokedAt || isExpired(share.expiresAt)) {
    notFound();
  }

  if (share.passwordHash && !(await verifyShareAccess(token))) {
    return <SharePasswordGate token={token} error={error} />;
  }

  await trackShareView(share.id, "gallery", "Collection");
  const projects = await getProjectsByIds(share.projectIds, true);
  const profile = getProfile();

  return (
    <ShareGallery
      token={token}
      projects={projects}
      jobTitle={share.jobTitle}
      clientName={share.clientName}
      profileName={profile.name}
      profileTitle={profile.title}
      tagline={profile.tagline}
    />
  );
}
