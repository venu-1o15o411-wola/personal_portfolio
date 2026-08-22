import { notFound } from "next/navigation";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getProjectById, getTaxonomy } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, taxonomy] = await Promise.all([
    getProjectById(Number(id)),
    getTaxonomy(),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-admin-ink/40">
            Edit
          </p>
          <h1 className="mt-1 font-serif text-4xl">{project.title}</h1>
        </div>
        <DeleteProjectButton
          id={project.id}
          title={project.title}
          redirectTo="/admin/projects"
        />
      </div>
      <ProjectForm
        taxonomy={taxonomy}
        initial={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          pitch: project.pitch,
          coverImageUrl: project.coverImageUrl ?? "",
          subcategoryId: String(project.subcategoryId),
          extraSubcategoryIds: project.extraSubcategoryIds,
          tags: project.tags.join(", "),
          techStack: project.techStack.join(", "),
          theAsk: project.theAsk,
          walkedInto: project.walkedInto,
          theBuild: project.theBuild,
          inTheirHands: project.inTheirHands,
          clientNote: project.clientNote,
          liveUrl: project.liveUrl ?? "",
          repoUrl: project.repoUrl ?? "",
          role: project.role ?? "",
          duration: project.duration ?? "",
          featured: project.featured,
          published: project.published,
          metrics: (project.metrics ?? [])
            .map((metric) => `${metric.value} | ${metric.label}`)
            .join("\n"),
          images: project.images.map((image) => ({
            url: image.url,
            caption: image.caption,
            kind: (image.kind === "video" ? "video" : "image") as "image" | "video",
            posterUrl: image.posterUrl ?? "",
          })),
        }}
      />
    </div>
  );
}
