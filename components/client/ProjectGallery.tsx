"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { type GalleryItem, mediaKindFrom } from "@/lib/media";
import { MediaFrame } from "./MediaFrame";

function itemKind(item: GalleryItem) {
  return item.kind || mediaKindFrom(item.url);
}

function mosaicClass(index: number, total: number) {
  if (total === 1) return "col-span-12 aspect-[16/10]";
  if (total === 2) {
    return index === 0
      ? "col-span-12 aspect-[16/10] md:col-span-7 md:aspect-[4/3] md:translate-y-6"
      : "col-span-12 aspect-[4/5] md:col-span-5 md:-translate-y-8";
  }
  if (total === 3) {
    return [
      "col-span-12 aspect-[16/10] md:col-span-8 md:row-span-2 md:aspect-auto md:min-h-[34rem]",
      "col-span-6 aspect-square md:col-span-4",
      "col-span-6 aspect-[4/5] md:col-span-4",
    ][index];
  }
  const cycle = [
    "col-span-12 aspect-[16/10] md:col-span-8",
    "col-span-6 aspect-square md:col-span-4 md:translate-y-12",
    "col-span-6 aspect-[4/5] md:col-span-5 md:-translate-y-6",
    "col-span-12 aspect-[16/10] md:col-span-7",
    "col-span-6 aspect-[16/10] md:col-span-6",
    "col-span-6 aspect-square md:col-span-6 md:translate-y-4",
  ];
  return cycle[index % cycle.length];
}

export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  const videos = useMemo(
    () => items.filter((item) => itemKind(item) === "video"),
    [items],
  );
  const screens = useMemo(
    () => items.filter((item) => itemKind(item) !== "video"),
    [items],
  );
  const premiere = videos[0] ?? null;
  const mosaic = useMemo(() => [...videos.slice(1), ...screens], [videos, screens]);
  const ordered = useMemo(
    () => (premiere ? [premiere, ...mosaic] : mosaic),
    [premiere, mosaic],
  );

  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = ordered[active];
  const currentKind = current ? itemKind(current) : "image";

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setActive((value) => (value + 1) % ordered.length);
      if (event.key === "ArrowLeft") {
        setActive((value) => (value - 1 + ordered.length) % ordered.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, ordered.length]);

  if (ordered.length === 0) return null;

  function openAt(item: GalleryItem) {
    const index = ordered.findIndex((entry) => entry.url === item.url);
    setActive(index < 0 ? 0 : index);
    setOpen(true);
  }

  function step(delta: number) {
    setActive((value) => (value + delta + ordered.length) % ordered.length);
  }

  return (
    <div className="w-full max-w-full">
      {premiere ? (
        <figure className="relative mb-4">
          <div
            className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_40%,rgba(66,184,131,0.22),transparent_62%)] blur-2xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-2 shadow-[0_40px_120px_-32px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass">
                Walkthrough
              </p>
              {premiere.caption ? (
                <p className="min-w-0 truncate text-sm text-muted">{premiere.caption}</p>
              ) : null}
            </div>
            <MediaFrame
              item={premiere}
              className="aspect-video"
              imgClassName="h-full w-full object-cover"
              autoPlay
              muted
              controls
            />
          </div>
        </figure>
      ) : null}

      {mosaic.length > 0 ? (
        <div className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass">
                Stills
              </p>
              <p className="mt-1 text-sm text-muted">
                {mosaic.length} frame{mosaic.length === 1 ? "" : "s"} from the product
              </p>
            </div>
            <p className="hidden font-mono text-[11px] text-white/35 sm:block">
              {String(mosaic.length).padStart(2, "0")} / {String(ordered.length).padStart(2, "0")}
            </p>
          </div>
          <div className="gallery-mosaic grid grid-cols-12 gap-3 py-4 md:gap-5">
            {mosaic.map((item, index) => (
              <MosaicTile
                key={`${item.url}-${index}`}
                item={item}
                index={index}
                total={mosaic.length}
                onOpen={() => openAt(item)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {open && current ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/94 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
            <p className="min-w-0 truncate font-mono text-xs tracking-wide text-white/55">
              {String(active + 1).padStart(2, "0")} — {current.caption || (currentKind === "video" ? "Walkthrough" : "Still")}
            </p>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-brass/50 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative mx-auto flex min-h-0 w-full min-w-0 max-w-6xl flex-1 items-center justify-center">
            {ordered.length > 1 ? (
              <button
                type="button"
                className="absolute left-0 z-10 hidden h-12 w-12 -translate-x-2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white sm:flex"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous media"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}
            <div className="min-w-0 w-full" onClick={(event) => event.stopPropagation()}>
              <MediaFrame
                item={current}
                className={
                  currentKind === "video"
                    ? "aspect-video w-full rounded-[1.5rem]"
                    : "max-h-[78vh] w-full rounded-[1.5rem]"
                }
                imgClassName="max-h-[78vh] w-full object-contain"
                controls
                autoPlay={currentKind === "video"}
                muted={false}
              />
            </div>
            {ordered.length > 1 ? (
              <button
                type="button"
                className="absolute right-0 z-10 hidden h-12 w-12 translate-x-2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white sm:flex"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                aria-label="Next media"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MosaicTile({
  item,
  index,
  total,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const kind = itemKind(item);
  const [hot, setHot] = useState(false);
  const tilt = index % 2 === 0 ? "md:rotate-[-1.4deg]" : "md:rotate-[1.1deg]";

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className={`gallery-tile group relative min-w-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-ink-2 text-left shadow-[0_24px_50px_-28px_rgba(0,0,0,0.9)] transition duration-500 hover:z-10 hover:rotate-0 hover:border-brass/35 hover:shadow-[0_30px_70px_-24px_rgba(66,184,131,0.35)] ${tilt} ${mosaicClass(index, total)}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="absolute inset-0">
        <MediaFrame
          item={item}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
          preview={kind === "video" ? !hot : false}
          autoPlay={kind === "video" && hot}
          muted
          controls={false}
        />
      </div>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />
      {kind === "video" ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brass text-ink shadow-lg">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
        </span>
      ) : null}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <span className="min-w-0">
          <span className="block font-mono text-[10px] tracking-[0.18em] text-brass">
            {String(index + 1).padStart(2, "0")}
          </span>
          {item.caption ? (
            <span className="mt-1 block truncate text-sm font-medium text-white">{item.caption}</span>
          ) : null}
        </span>
        <span className="hidden rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white/70 sm:inline">
          {kind === "video" ? "Play" : "View"}
        </span>
      </span>
    </button>
  );
}
