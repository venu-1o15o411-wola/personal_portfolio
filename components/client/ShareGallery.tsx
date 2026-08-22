"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProjectRecord } from "@/lib/db/queries";
import { ClientHeader } from "./ClientHeader";

export function ShareGallery({
  token,
  projects,
  jobTitle,
  clientName,
  profileName,
  profileTitle,
  tagline,
}: {
  token: string;
  projects: ProjectRecord[];
  jobTitle?: string | null;
  clientName?: string | null;
  profileName: string;
  profileTitle: string;
  tagline: string;
}) {
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const project of projects) {
      map.set(project.category.slug, project.category.name);
    }
    return [...map.entries()];
  }, [projects]);

  const [filter, setFilter] = useState("all");
  const visible =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category.slug === filter);

  return (
    <div className="starfield min-h-screen text-cream">
      <ClientHeader
        name={profileName}
        href={`/p/${token}`}
        right={
          <span className="text-muted">
            {clientName ? `Prepared for ${clientName}` : "Selected work"}
          </span>
        }
      />

      <section className="mx-auto max-w-6xl px-6 pb-14 pt-10 sm:px-10 sm:pt-16">
        <p className="text-sm font-medium text-muted">{profileTitle}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {jobTitle || "Selected work for this role"}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {tagline} A focused set from {profileName} — not the full archive.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-brass" />
            {projects.length} case {projects.length === 1 ? "study" : "studies"}
          </span>
        </div>
      </section>

      {categories.length > 1 ? (
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-8 sm:px-10">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              filter === "all"
                ? "bg-brass font-medium text-ink"
                : "bg-ink-2 text-cream hover:bg-ink-3"
            }`}
          >
            All
          </button>
          {categories.map(([slug, label]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setFilter(slug)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                filter === slug
                  ? "bg-brass font-medium text-ink"
                  : "bg-ink-2 text-cream hover:bg-ink-3"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 sm:px-10 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <Link
            key={project.id}
            href={`/p/${token}/${project.slug}`}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-ink-2/70 transition hover:border-brass/40"
          >
            <div className="aspect-16/10 overflow-hidden bg-ink">
              {project.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.coverImageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-end p-5 text-3xl font-bold text-white/10">
                  {project.category.code}
                </div>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-brass">
                {project.category.name} / {project.subcategory.name}
              </p>
              <h2 className="mt-2 text-lg font-bold tracking-tight text-white group-hover:text-brass">
                {project.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{project.pitch}</p>
              {project.techStack.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-ink px-2 py-0.5 text-[11px] text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
