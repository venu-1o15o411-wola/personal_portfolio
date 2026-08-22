import { ProjectForm } from "@/components/admin/ProjectForm";
import { getTaxonomy } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const taxonomy = await getTaxonomy();
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-admin-ink/40">
          New
        </p>
        <h1 className="mt-1 font-serif text-4xl">Case study</h1>
      </div>
      <ProjectForm taxonomy={taxonomy} />
    </div>
  );
}
