"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProjectsAction } from "@/app/admin/actions";
import type { ProjectRecord, TaxonomyTree } from "@/lib/db/queries";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { ShareComposer } from "./ShareComposer";

export function ProjectLibrary({
  projects,
  taxonomy,
}: {
  projects: ProjectRecord[];
  taxonomy: TaxonomyTree[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [subId, setSubId] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ids = new Set(projects.map((project) => project.id));
    setSelected((prev) => prev.filter((id) => ids.has(id)));
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const haystack =
        `${project.title} ${project.pitch} ${project.tags.join(" ")} ${project.techStack.join(" ")}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesSub = !subId || String(project.subcategory.id) === subId;
      return matchesQuery && matchesSub;
    });
  }, [projects, query, subId]);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function deleteSelected() {
    if (selected.length === 0) return;
    const label =
      selected.length === 1 ? "this project" : `${selected.length} projects`;
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteProjectsAction(selected);
      setSelected([]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
          placeholder="Search projects"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm md:w-72"
          value={subId}
          onChange={(e) => setSubId(e.target.value)}
        >
          <option value="">All categories</option>
          {taxonomy.map((cat) => (
            <optgroup key={cat.id} label={`${cat.code} ${cat.name}`}>
              {cat.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {selected.length > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={deleteSelected}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-700 disabled:opacity-50"
          >
            {busy ? "Deleting…" : `Delete selected (${selected.length})`}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => {
          const checked = selected.includes(project.id);
          return (
            <article
              key={project.id}
              className={`overflow-hidden rounded-2xl border bg-white ${
                checked ? "border-ink" : "border-black/10"
              }`}
            >
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => toggle(project.id)}
              >
                <div className="aspect-16/10 bg-stone">
                  {project.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-end p-4 font-mono text-xs text-admin-ink/30">
                      {project.category.code}
                    </div>
                  )}
                </div>
              </button>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-admin-ink/45">
                      {project.category.name} / {project.subcategory.name}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(project.id)}
                  />
                </div>
                <p className="line-clamp-2 text-sm text-admin-ink/60">
                  {project.pitch}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`text-xs ${project.published ? "text-brass-dim" : "text-admin-ink/35"}`}
                  >
                    {project.published ? "Published" : "Draft"}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-sm text-admin-ink/70"
                    >
                      Edit
                    </Link>
                    <DeleteProjectButton
                      id={project.id}
                      title={project.title}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-admin-ink/50">
          No projects match this filter.
        </p>
      ) : null}

      <ShareComposer selectedIds={selected} />
    </div>
  );
}
