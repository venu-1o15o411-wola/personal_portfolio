"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { GalleryItem } from "@/lib/media";
import { mediaKindFrom } from "@/lib/media";
import { engagementBeats } from "@/lib/story";
import { ClientHeader } from "./ClientHeader";
import { MediaFrame } from "./MediaFrame";
import { ProjectGallery } from "./ProjectGallery";
import { StoryCredits, StoryReel } from "./StoryReel";

type Neighbor = { slug: string; title: string; coverImageUrl?: string | null };

export type CaseStudyViewProps = {
  token: string;
  profileName: string;
  title: string;
  pitch: string;
  coverImageUrl: string | null;
  category: string;
  subcategory: string;
  role: string | null;
  duration: string | null;
  liveUrl: string | null;
  theAsk: string;
  walkedInto: string;
  theBuild: string;
  inTheirHands: string;
  clientNote?: string | null;
  techStack: string[];
  metrics: { value: string; label: string }[];
  reason?: string | null;
  media: GalleryItem[];
  previous?: Neighbor | null;
  next?: Neighbor | null;
};

export function CaseStudyView(props: CaseStudyViewProps) {
  const collectionHref = `/p/${props.token}`;
  const hero = props.coverImageUrl
    ? {
        url: props.coverImageUrl,
        caption: props.title,
        kind: mediaKindFrom(props.coverImageUrl),
        posterUrl: null,
      }
    : props.media[0];
  const beats = engagementBeats
    .map((beat, index) => ({
      id: beat.id,
      index: String(index + 1).padStart(2, "0"),
      title: beat.title,
      kicker: beat.kicker,
      body: props[beat.key],
    }))
    .filter((beat) => beat.body);
  const facts = [
    props.role ? { label: "Role", value: props.role } : null,
    props.duration ? { label: "Timeline", value: props.duration } : null,
    { label: "Focus", value: props.subcategory },
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-ink text-cream">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-ink/85 backdrop-blur-md">
        <ClientHeader
          name={props.profileName}
          href={collectionHref}
          right={
            <Link
              href={collectionHref}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-cream transition hover:border-brass/40 hover:bg-brass/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All work
            </Link>
          }
        />
      </div>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_85%_10%,rgba(66,184,131,0.16),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 lg:py-16">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-brass">
              {props.category}
              <span className="text-white/30">/</span>
              <span className="text-cream/80">{props.subcategory}</span>
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight wrap-break-word text-white sm:text-5xl lg:text-6xl">
              {props.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-cream/75 sm:text-lg">{props.pitch}</p>
            {facts.length > 0 ? (
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 truncate text-sm font-medium text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {props.liveUrl ? (
              <a
                href={props.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-brass-dim"
              >
                View live site
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>

          {hero ? (
            <div className="min-w-0">
              <div className="relative">
                <div
                  className="absolute -inset-8 rounded-[2.5rem] bg-brass/20 blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-2 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.7)] lg:-rotate-1 lg:transition-transform lg:duration-500 lg:hover:rotate-0">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    <span className="ml-2 hidden h-6 min-w-0 flex-1 items-center rounded-md bg-white/5 px-3 text-[11px] text-muted sm:flex">
                      {props.title}
                    </span>
                  </div>
                  <MediaFrame
                    item={hero}
                    className="aspect-[16/10]"
                    imgClassName="h-full w-full object-cover"
                    autoPlay={hero.kind === "video"}
                    muted
                    controls={false}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {props.metrics.length > 0 ? (
        <section className="border-y border-white/10 bg-ink-2/80">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3 sm:px-10">
            {props.metrics.map((metric) => (
              <div key={metric.label} className="min-w-0 border-l-2 border-brass/70 pl-4">
                <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{metric.value}</p>
                <p className="mt-2 text-sm text-muted">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {props.reason ? (
        <section className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
          <aside className="rounded-2xl border border-brass/25 bg-brass/10 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">
              Why this is relevant
            </p>
            <p className="mt-2 max-w-3xl text-base leading-7 text-cream/90">{props.reason}</p>
          </aside>
        </section>
      ) : null}

      {props.media.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
          <ProjectGallery items={props.media} />
        </section>
      ) : null}

      <StoryReel beats={beats} clientNote={props.clientNote} climaxId="in-their-hands" resultMetrics={props.metrics} />
      <StoryCredits stack={props.techStack} />

      <nav aria-label="More case studies" className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Continue</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {props.previous ? (
            <NeighborCard
              href={`/p/${props.token}/${props.previous.slug}`}
              direction="previous"
              title={props.previous.title}
              coverImageUrl={props.previous.coverImageUrl}
            />
          ) : (
            <NeighborCard
              href={collectionHref}
              direction="previous"
              kicker="Back"
              title="All work"
              description="Return to the shared collection"
            />
          )}
          {props.next ? (
            <NeighborCard
              href={`/p/${props.token}/${props.next.slug}`}
              direction="next"
              title={props.next.title}
              coverImageUrl={props.next.coverImageUrl}
            />
          ) : (
            <NeighborCard
              href={collectionHref}
              direction="next"
              kicker="Done"
              title="All work"
              description="Return to the shared collection"
            />
          )}
        </div>
      </nav>
    </div>
  );
}

function NeighborCard({
  href,
  direction,
  title,
  kicker,
  description,
  coverImageUrl,
}: {
  href: string;
  direction: "previous" | "next";
  title: string;
  kicker?: string;
  description?: string;
  coverImageUrl?: string | null;
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={href}
      className={`group relative min-h-44 overflow-hidden rounded-[1.6rem] border border-white/10 bg-ink-2 ${
        isNext ? "text-right" : ""
      }`}
    >
      {coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105 group-hover:opacity-50"
        />
      ) : (
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(66,184,131,0.18),transparent_50%)]" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
      <span className="relative flex h-full min-h-44 flex-col justify-end p-5 sm:p-6">
        <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brass ${isNext ? "justify-end" : ""}`}>
          {isNext ? null : <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
          {kicker || (isNext ? "Next project" : "Previous project")}
          {isNext ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </span>
        <span className="mt-2 block text-xl font-semibold tracking-tight text-white">{title}</span>
        {description ? <span className="mt-1 block text-sm text-muted">{description}</span> : null}
      </span>
    </Link>
  );
}
