"use client";

import { useMemo, useState } from "react";
import { matchJobAction } from "@/app/admin/actions";
import type { ProjectRecord } from "@/lib/db/queries";
import type { MatchResult } from "@/lib/match";
import { ShareComposer } from "./ShareComposer";

export function MatchWorkbench({
  projects,
  hasOpenAIKey,
}: {
  projects: ProjectRecord[];
  hasOpenAIKey: boolean;
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const byId = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  async function analyze() {
    setBusy(true);
    setError("");
    try {
      const next = await matchJobAction(jobDescription);
      setResult(next);
      setSelected(
        next.matches.filter((item) => item.score >= 0.55).map((item) => item.projectId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Match failed");
    } finally {
      setBusy(false);
    }
  }

  const reasons = Object.fromEntries(
    (result?.matches || [])
      .filter((item) => selected.includes(item.projectId))
      .map((item) => [String(item.projectId), item.reason]),
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/10 bg-white p-5">
        <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-admin-ink/50">
          Upwork job description
        </label>
        <textarea
          rows={10}
          className="w-full rounded-xl border border-black/10 px-3 py-3 text-sm outline-none ring-brass/40 focus:ring-2"
          placeholder="Paste the job post…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            disabled={busy || jobDescription.trim().length < 20}
            onClick={analyze}
            className="rounded-full bg-ink px-5 py-2.5 text-sm text-cream disabled:opacity-40"
          >
            {busy ? "Analyzing…" : "Find matching work"}
          </button>
          {result ? (
            result.usedFallback ? (
              <p className="text-sm text-admin-ink/50">
                Keyword fallback
                {result.fallbackReason ? ` — ${result.fallbackReason}` : ""}.
              </p>
            ) : (
              <p className="text-sm text-brass-dim">
                Ranked with OpenAI {result.model}.
              </p>
            )
          ) : hasOpenAIKey ? (
            <p className="text-sm text-admin-ink/50">Uses OpenAI gpt-5.6-luna.</p>
          ) : (
            <p className="text-sm text-admin-ink/50">
              OpenAI key missing — will use keyword overlap.
            </p>
          )}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </section>

      {result ? (
        <>
          <div className="flex flex-wrap gap-2">
            {result.extracted.domain ? (
              <span className="rounded-full bg-stone px-3 py-1 text-xs">{result.extracted.domain}</span>
            ) : null}
            {[
              ...new Set(
                [...result.extracted.skills, ...result.extracted.platforms]
                  .map((item) => item.trim())
                  .filter(Boolean),
              ),
            ]
              .filter((item) => item !== result.extracted.domain)
              .slice(0, 10)
              .map((item, index) => (
                <span key={`${item}-${index}`} className="rounded-full bg-stone px-3 py-1 text-xs">
                  {item}
                </span>
              ))}
          </div>

          <div className="space-y-3">
            {result.matches.length === 0 ? (
              <p className="text-sm text-admin-ink/50">No strong matches. Select projects manually from the library.</p>
            ) : (
              result.matches.map((match) => {
                const project = byId.get(match.projectId);
                if (!project) return null;
                const checked = selected.includes(project.id);
                return (
                  <label
                    key={project.id}
                    className={`flex cursor-pointer gap-4 rounded-2xl border p-4 ${
                      checked ? "border-ink bg-white" : "border-black/10 bg-white/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={(e) => {
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, project.id]
                            : prev.filter((id) => id !== project.id),
                        );
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-sm text-admin-ink/50">
                            {project.category.name} / {project.subcategory.name}
                          </p>
                        </div>
                        <span className="font-mono text-sm text-brass-dim">
                          {Math.round(match.score * 100)}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-admin-ink/70">{match.reason}</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <ShareComposer
            selectedIds={selected}
            matchReasons={reasons}
            jobDescription={jobDescription}
            defaultJobTitle={result.extracted.domain}
          />
        </>
      ) : null}
    </div>
  );
}
