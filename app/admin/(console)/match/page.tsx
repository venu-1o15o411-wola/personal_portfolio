import { MatchWorkbench } from "@/components/admin/MatchWorkbench";
import { listProjects } from "@/lib/db/queries";
import { MATCH_MODEL } from "@/lib/match";

export const dynamic = "force-dynamic";

export default async function MatchPage() {
  const projects = await listProjects({ published: true });
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-admin-ink/40">
          Upwork
        </p>
        <h1 className="mt-1 font-serif text-4xl">Match a job</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-ink/55">
          Paste a job description. Review the ranked case studies, then generate a
          client link. Nothing is shared until you confirm.
        </p>
        <p className="mt-3 text-sm text-admin-ink/55">
          {hasOpenAIKey
            ? `OpenAI is connected — matching with ${MATCH_MODEL}.`
            : "OPENAI_API_KEY is missing — matching will use keyword overlap."}
        </p>
      </div>
      {projects.length === 0 ? (
        <p className="text-sm text-admin-ink/50">
          Publish at least one case study before matching.
        </p>
      ) : (
        <MatchWorkbench projects={projects} hasOpenAIKey={hasOpenAIKey} />
      )}
    </div>
  );
}
