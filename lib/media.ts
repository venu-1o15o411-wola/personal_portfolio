export type MediaKind = "image" | "video";

export type GalleryItem = {
  url: string;
  caption: string;
  kind: MediaKind;
  posterUrl?: string | null;
};

export function isVideoUrl(url: string, mime?: string) {
  if (mime?.startsWith("video/")) return true;
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) return true;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export function mediaKindFrom(url: string, mime?: string): MediaKind {
  return isVideoUrl(url, mime) ? "video" : "image";
}

export function youtubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/,
  );
  return match?.[1] ?? null;
}

export function vimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}
