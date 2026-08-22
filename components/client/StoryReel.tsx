"use client";

import { useEffect, useState } from "react";

export type StoryBeat = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  body: string;
};

export function StoryReel({
  beats,
  clientNote,
  climaxId = "in-their-hands",
  resultMetrics = [],
}: {
  beats: StoryBeat[];
  clientNote?: string | null;
  climaxId?: string;
  resultMetrics?: { value: string; label: string }[];
}) {
  const [active, setActive] = useState(beats[0]?.id ?? "");

  useEffect(() => {
    if (beats.length === 0) return;
    const nodes = beats
      .map((beat) => document.getElementById(beat.id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.4, 0.7] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [beats]);

  if (beats.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass">
          On the job
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          How this engagement actually went.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          Kickoff, the messy room, the calls I made with them in it — then what
          they open on Monday.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-16">
        <nav
          aria-label="Story scenes"
          className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
        >
          <ol className="space-y-1">
            {beats.map((beat) => {
              const isActive = beat.id === active;
              return (
                <li key={beat.id}>
                  <a
                    href={`#${beat.id}`}
                    className={`group flex items-baseline gap-3 rounded-full px-3 py-2 transition ${
                      isActive ? "text-white" : "text-muted hover:text-cream"
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] tracking-widest ${
                        isActive ? "text-brass" : "text-white/30"
                      }`}
                    >
                      {beat.index}
                    </span>
                    <span className="text-sm font-medium">{beat.title}</span>
                  </a>
                  {isActive ? (
                    <span
                      className="ml-3 block h-px w-16 bg-brass"
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="story-spine relative pl-8 sm:pl-12">
          {beats.map((beat, index) => {
            const isClimax = beat.id === climaxId;
            return (
              <article
                key={beat.id}
                id={beat.id}
                className={`relative scroll-mt-32 ${
                  index === beats.length - 1 && !clientNote
                    ? "pb-4"
                    : "pb-20 sm:pb-28"
                }`}
              >
                <span
                  className={`absolute left-[1.4rem] top-3 h-3.5 w-3.5 rounded-full border-2 sm:left-[1.65rem] ${
                    beat.id === active
                      ? "border-brass bg-brass shadow-[0_0_18px_rgba(66,184,131,0.8)]"
                      : "border-brass/70 bg-ink"
                  }`}
                  aria-hidden="true"
                />

                <p className="story-num pointer-events-none absolute -top-8 right-0 select-none font-mono text-[6.5rem] leading-none font-bold tracking-tight text-white/4 sm:-top-10 sm:text-[8.5rem]">
                  {beat.index}
                </p>

                <p className="font-mono text-[11px] tracking-[0.22em] text-brass">
                  {beat.index}
                </p>
                <p className="mt-3 text-sm text-muted">{beat.kicker}</p>
                <h3 className="mt-1 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {beat.title}
                </h3>

                {isClimax ? (
                  <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-brass/25 bg-brass/10 px-6 py-8 sm:px-10 sm:py-10">
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brass/20 blur-3xl"
                      aria-hidden="true"
                    />
                    <p className="relative max-w-2xl whitespace-pre-wrap text-lg leading-9 text-cream/90">
                      {beat.body}
                    </p>
                    {resultMetrics.length > 0 ? (
                      <dl className="relative mt-10 grid gap-6 sm:grid-cols-3">
                        {resultMetrics.map((metric) => (
                          <div key={metric.label} className="min-w-0">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">
                              {metric.label}
                            </dt>
                            <dd className="mt-2 text-3xl font-bold tracking-tight text-white">
                              {metric.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-8 max-w-2xl whitespace-pre-wrap text-lg leading-9 text-cream/75">
                    {beat.body}
                  </p>
                )}
              </article>
            );
          })}
          {clientNote ? (
            <figure className="relative mt-4 max-w-2xl pb-4 pl-1">
              <span
                className="absolute left-[1.4rem] top-3 h-3.5 w-3.5 rounded-full border-2 border-brass bg-ink sm:left-[1.65rem]"
                aria-hidden="true"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass">
                From the client
              </p>
              <blockquote className="mt-4 text-2xl font-medium leading-snug tracking-tight text-white sm:text-3xl">
                “{clientNote}”
              </blockquote>
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function StoryCredits({ stack }: { stack: string[] }) {
  if (stack.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-8 pt-4 sm:px-10">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-6 py-10 sm:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
          Credits
        </p>
        <p className="mt-2 text-sm text-muted">Shot with this stack</p>
        <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-4">
          {stack.map((item, index) => (
            <li
              key={item}
              className="flex items-baseline gap-3 text-xl font-semibold tracking-tight text-white sm:text-2xl"
            >
              <span>{item}</span>
              {index < stack.length - 1 ? (
                <span className="text-brass/70" aria-hidden="true">
                  ·
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
