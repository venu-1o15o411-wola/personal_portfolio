import Link from "next/link";
import { OverviewBoard } from "@/components/admin/OverviewBoard";
import { getDashboardStats } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-admin-ink/40">
            Overview
          </p>
          <h1 className="mt-1 font-serif text-4xl">Portfolio library</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/match"
            className="rounded-md bg-brass px-4 py-2 text-sm font-semibold text-ink"
          >
            Match a job
          </Link>
          <Link
            href="/admin/projects/new"
            className="rounded-md bg-ink px-4 py-2 text-sm text-cream"
          >
            New project
          </Link>
        </div>
      </div>

      <OverviewBoard stats={stats} />
    </div>
  );
}
