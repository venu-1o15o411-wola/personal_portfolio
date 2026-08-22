"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { saveProjectAction } from "@/app/admin/actions";
import type { TaxonomyTree } from "@/lib/db/queries";
import { mediaKindFrom } from "@/lib/media";
import { engagementBeats } from "@/lib/story";
import { slugify } from "@/lib/format";

type ImageItem = {
  url: string;
  caption: string;
  kind: "image" | "video";
  posterUrl: string;
};

type FormState = {
  title: string;
  slug: string;
  pitch: string;
  coverImageUrl: string;
  subcategoryId: string;
  extraSubcategoryIds: number[];
  tags: string;
  techStack: string;
  theAsk: string;
  walkedInto: string;
  theBuild: string;
  inTheirHands: string;
  clientNote: string;
  liveUrl: string;
  repoUrl: string;
  role: string;
  duration: string;
  featured: boolean;
  published: boolean;
  metrics: string;
  images: ImageItem[];
};

export function ProjectForm({
  taxonomy,
  initial,
}: {
  taxonomy: TaxonomyTree[];
  initial?: Partial<FormState> & { id?: number };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [mediaUrl, setMediaUrl] = useState("");
  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    pitch: initial?.pitch ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    subcategoryId:
      initial?.subcategoryId ?? String(taxonomy[0]?.subcategories[0]?.id ?? ""),
    extraSubcategoryIds: initial?.extraSubcategoryIds ?? [],
    tags: initial?.tags ?? "",
    techStack: initial?.techStack ?? "",
    theAsk: initial?.theAsk ?? "",
    walkedInto: initial?.walkedInto ?? "",
    theBuild: initial?.theBuild ?? "",
    inTheirHands: initial?.inTheirHands ?? "",
    clientNote: initial?.clientNote ?? "",
    liveUrl: initial?.liveUrl ?? "",
    repoUrl: initial?.repoUrl ?? "",
    role: initial?.role ?? "",
    duration: initial?.duration ?? "",
    featured: initial?.featured ?? false,
    published: initial?.published ?? false,
    metrics: initial?.metrics ?? "",
    images: initial?.images ?? [],
  });

  const extraOptions = useMemo(
    () =>
      taxonomy.flatMap((cat) =>
        cat.subcategories.map((sub) => ({ ...sub, category: cat.name })),
      ),
    [taxonomy],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    if (!response.ok) throw new Error("Upload failed");
    const data = (await response.json()) as { url: string };
    return data.url;
  }

  async function onCover(file: File | undefined) {
    if (!file) return;
    const url = await uploadFile(file);
    update("coverImageUrl", url);
  }

  async function onGallery(files: FileList | null) {
    if (!files?.length) return;
    const uploaded: ImageItem[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      uploaded.push({
        url,
        caption: "",
        kind: mediaKindFrom(url, file.type),
        posterUrl: "",
      });
    }
    update("images", [...form.images, ...uploaded]);
  }

  function addMediaUrl() {
    const url = mediaUrl.trim();
    if (!url) return;
    update("images", [
      ...form.images,
      { url, caption: "", kind: mediaKindFrom(url), posterUrl: "" },
    ]);
    setMediaUrl("");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await saveProjectAction({
        id: initial?.id ? String(initial.id) : undefined,
        title: form.title,
        slug: form.slug || slugify(form.title),
        pitch: form.pitch,
        coverImageUrl: form.coverImageUrl,
        subcategoryId: Number(form.subcategoryId),
        extraSubcategoryIds: form.extraSubcategoryIds,
        tags: form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        techStack: form.techStack
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        theAsk: form.theAsk,
        walkedInto: form.walkedInto,
        theBuild: form.theBuild,
        inTheirHands: form.inTheirHands,
        clientNote: form.clientNote,
        liveUrl: form.liveUrl,
        repoUrl: form.repoUrl,
        role: form.role,
        duration: form.duration,
        featured: form.featured,
        published: form.published,
        metrics: form.metrics
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [value, ...rest] = line.split("|");
            return {
              value: value.trim(),
              label: rest.join("|").trim() || value.trim(),
            };
          }),
        images: form.images,
      });
      router.push(`/admin/projects/${result.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none ring-brass/40 focus:ring-2";
  const label =
    "mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-admin-ink/50";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <label className="block">
            <span className={label}>Title</span>
            <input
              className={field}
              value={form.title}
              onChange={(event) => {
                update("title", event.target.value);
                if (!slugTouched) update("slug", slugify(event.target.value));
              }}
              required
            />
          </label>
          <label className="block">
            <span className={label}>One-line pitch</span>
            <input
              className={field}
              value={form.pitch}
              onChange={(e) => update("pitch", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>Slug</span>
            <input
              className={field}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
            />
          </label>
        </div>
        <div className="space-y-3">
          <span className={label}>Cover</span>
          <label className="flex aspect-4/3 cursor-pointer items-end overflow-hidden rounded-2xl border border-dashed border-black/15 bg-stone">
            {form.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="p-4 text-sm text-admin-ink/40">
                Upload cover
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onCover(e.target.files?.[0])}
            />
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={label}>Primary subcategory</span>
          <select
            className={field}
            value={form.subcategoryId}
            onChange={(e) => update("subcategoryId", e.target.value)}
          >
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
        </label>
        <label className="block">
          <span className={label}>Duration / role</span>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={field}
              placeholder="6 weeks"
              value={form.duration}
              onChange={(e) => update("duration", e.target.value)}
            />
            <input
              className={field}
              placeholder="Lead engineer"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </div>
        </label>
        <label className="block">
          <span className={label}>Tech stack (comma)</span>
          <input
            className={field}
            value={form.techStack}
            onChange={(e) => update("techStack", e.target.value)}
          />
        </label>
        <label className="block">
          <span className={label}>Tags (comma)</span>
          <input
            className={field}
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
          />
        </label>
        <label className="block">
          <span className={label}>Live URL</span>
          <input
            className={field}
            value={form.liveUrl}
            onChange={(e) => update("liveUrl", e.target.value)}
          />
        </label>
        <label className="block">
          <span className={label}>Repo URL (admin only)</span>
          <input
            className={field}
            value={form.repoUrl}
            onChange={(e) => update("repoUrl", e.target.value)}
          />
        </label>
      </section>

      <section>
        <span className={label}>Extra subcategories</span>
        <div className="mt-2 grid max-h-48 grid-cols-2 gap-2 overflow-auto rounded-2xl border border-black/10 bg-white p-3 md:grid-cols-3">
          {extraOptions.map((sub) => (
            <label key={sub.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.extraSubcategoryIds.includes(sub.id)}
                onChange={(e) => {
                  update(
                    "extraSubcategoryIds",
                    e.target.checked
                      ? [...form.extraSubcategoryIds, sub.id]
                      : form.extraSubcategoryIds.filter((id) => id !== sub.id),
                  );
                }}
              />
              <span>
                {sub.name}
                <span className="text-admin-ink/35"> · {sub.category}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className={label}>On the job</p>
          <p className="text-sm text-admin-ink/55">
            Write it like you were in the room with them — not a STAR interview
            answer.
          </p>
        </div>
        {engagementBeats.map((beat) => (
          <label key={beat.key} className="block">
            <span className={label}>{beat.adminLabel}</span>
            <span className="mb-2 block text-sm text-admin-ink/45">
              {beat.adminHint}
            </span>
            <textarea
              rows={5}
              className={field}
              value={form[beat.key]}
              onChange={(e) => update(beat.key, e.target.value)}
            />
          </label>
        ))}
        <label className="block">
          <span className={label}>From the client</span>
          <span className="mb-2 block text-sm text-admin-ink/45">
            One line in their voice. What they would tell the next client.
            Optional.
          </span>
          <textarea
            rows={3}
            className={field}
            value={form.clientNote}
            onChange={(e) => update("clientNote", e.target.value)}
            placeholder="We stopped answering the same MSA question in Slack."
          />
        </label>
      </section>

      <label className="block">
        <span className={label}>
          Metrics (one per line: 90s | Median answer time)
        </span>
        <textarea
          rows={4}
          className={field}
          value={form.metrics}
          onChange={(e) => update("metrics", e.target.value)}
          placeholder={"90s | Median answer time\n94% | Citation accuracy"}
        />
      </label>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className={label}>Gallery</span>
          <label className="cursor-pointer text-sm text-brass-dim">
            Upload screenshots or video
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={(e) => onGallery(e.target.files)}
            />
          </label>
        </div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            className={field}
            placeholder="Or paste image / YouTube / Vimeo / MP4 URL"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMediaUrl();
              }
            }}
          />
          <button
            type="button"
            className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-sm"
            onClick={addMediaUrl}
          >
            Add URL
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {form.images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white"
            >
              {image.kind === "video" &&
              /\.(mp4|webm|mov|m4v)(\?|$)/i.test(image.url) ? (
                <video
                  src={image.url}
                  className="h-40 w-full object-cover"
                  muted
                />
              ) : image.kind === "video" ? (
                <div className="flex h-40 items-center justify-center bg-zinc-900 text-sm text-white/70">
                  Video URL
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="space-y-2 p-3">
                <input
                  className={field}
                  placeholder="Caption"
                  value={image.caption}
                  onChange={(e) => {
                    const next = [...form.images];
                    next[index] = { ...image, caption: e.target.value };
                    update("images", next);
                  }}
                />
                {image.kind === "video" ? (
                  <input
                    className={field}
                    placeholder="Poster image URL (optional)"
                    value={image.posterUrl}
                    onChange={(e) => {
                      const next = [...form.images];
                      next[index] = { ...image, posterUrl: e.target.value };
                      update("images", next);
                    }}
                  />
                ) : null}
                <button
                  type="button"
                  className="text-sm text-admin-ink/40"
                  onClick={() =>
                    update(
                      "images",
                      form.images.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          Featured
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="ml-auto rounded-full bg-ink px-5 py-2.5 text-sm text-cream disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save case study"}
        </button>
      </div>
    </form>
  );
}
