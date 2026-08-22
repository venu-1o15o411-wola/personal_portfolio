import Link from "next/link";
import { ProjectLibrary } from "@/components/admin/ProjectLibrary";
import { getTaxonomy, listProjects } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, taxonomy] = await Promise.all([listProjects(), getTaxonomy()]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-admin-ink/40">
            Library
          </p>
          <h1 className="mt-1 font-serif text-4xl">Projects</h1>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-full bg-ink px-4 py-2 text-sm text-cream"
        >
          New case study
        </Link>
      </div>
      <ProjectLibrary projects={projects} taxonomy={taxonomy} />
    </div>
  );
}
