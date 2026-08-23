import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { galleryPhotos } from "@/lib/assets";
import { school } from "@/lib/school";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Rahma Junior Education Center" },
      {
        name: "description",
        content:
          "Photos from life at Rahma Junior Education Center: classrooms, celebrations, computer lessons and community moments.",
      },
      { property: "og:title", content: "Gallery — Rahma Junior Education Center" },
      {
        property: "og:description",
        content: "See our classrooms, celebrations and everyday school life.",
      },
      { property: "og:image", content: galleryPhotos[0]!.url },
      { name: "twitter:image", content: galleryPhotos[0]!.url },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-brand text-primary">Gallery</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-navy">
          Life at {school.shortName}
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          A glimpse of the learning, friendship and celebration that fill our school days.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryPhotos.map((photo, i) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => setActive(i)}
              className="group relative overflow-hidden rounded-xl shadow-panel"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                loading="lazy"
                className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent p-4 text-left text-sm font-medium text-navy-foreground">
                {photo.caption}
              </span>
            </button>
          ))}
        </div>
      </main>
      <SiteFooter />

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {active !== null && (
            <figure>
              <img
                src={galleryPhotos[active]!.url}
                alt={galleryPhotos[active]!.caption}
                className="w-full object-contain"
              />
              <figcaption className="p-4 text-sm text-muted-foreground">
                {galleryPhotos[active]!.caption}
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
