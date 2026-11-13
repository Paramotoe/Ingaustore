"use client";

import { useEffect, useState } from "react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: { id: string; url: string; altText?: string | null }[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-surface-elevated text-muted-foreground">
        Tanpa foto
      </div>
    );
  }

  const current = images[active];

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block w-full overflow-hidden rounded-2xl bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-focus-ring"
        aria-label="Buka galeri foto"
      >
        <div className="aspect-[4/5] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.altText ?? productName}
            className="h-full w-full object-cover"
          />
        </div>
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive((i) => (i - 1 + images.length) % images.length);
              }}
              aria-label="Foto sebelumnya"
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-foreground backdrop-blur transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-focus-ring"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive((i) => (i + 1) % images.length);
              }}
              aria-label="Foto berikutnya"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-foreground backdrop-blur transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-focus-ring"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </button>

      {hasMultiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((im, i) => (
            <button
              key={im.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Pilih foto ${i + 1}`}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="h-16 w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt={im.altText ?? productName} className="h-full w-full object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeri foto"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Tutup"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            ✕
          </button>
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Foto sebelumnya"
                className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i + 1) % images.length);
                }}
                aria-label="Foto berikutnya"
                className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                ›
              </button>
            </>
          )}
          <div onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.altText ?? productName}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}