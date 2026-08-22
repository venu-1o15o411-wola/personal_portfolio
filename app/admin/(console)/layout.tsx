import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const profile = getProfile();
  return <AdminShell profileName={profile.name}>{children}</AdminShell>;
}
