"use client";

import { mediaKindFrom, vimeoId, youtubeId, type GalleryItem } from "@/lib/media";

export function MediaFrame({
  item,
  className = "",
  imgClassName = "h-full w-full object-cover",
  autoPlay = false,
  controls = false,
  muted = true,
  preview = false,
}: {
  item: GalleryItem;
  className?: string;
  imgClassName?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  preview?: boolean;
}) {
  const kind = item.kind || mediaKindFrom(item.url);
  const yt = youtubeId(item.url);
  const vimeo = vimeoId(item.url);

  if (kind === "video" && preview) {
    const poster =
      item.posterUrl || (yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : null);
    return (
      <div className={`relative w-full max-w-full overflow-hidden bg-ink-2 ${className}`}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={item.caption || ""} className={`block max-w-full ${imgClassName}`} />
        ) : (
          <video
            src={item.url}
            className={`block max-w-full ${imgClassName}`}
            muted
            playsInline
            preload="metadata"
          />
        )}
      </div>
    );
  }

  if (kind === "video" && yt) {
    return (
      <div className={`relative w-full max-w-full overflow-hidden bg-ink ${className}`}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${yt}?rel=0${autoPlay ? "&autoplay=1" : ""}`}
          title={item.caption || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (kind === "video" && vimeo) {
    return (
      <div className={`relative w-full max-w-full overflow-hidden bg-ink ${className}`}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://player.vimeo.com/video/${vimeo}${autoPlay ? "?autoplay=1" : ""}`}
          title={item.caption || "Video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className={`relative w-full max-w-full overflow-hidden bg-ink ${className}`}>
        <video
          src={item.url}
          poster={item.posterUrl || undefined}
          className={`block max-w-full ${imgClassName}`}
          autoPlay={autoPlay}
          muted={muted}
          loop={autoPlay}
          controls={controls || !autoPlay}
          playsInline
        />
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full overflow-hidden bg-ink-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt={item.caption || ""} className={`block max-w-full ${imgClassName}`} />
    </div>
  );
}
