import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { galleryPhotos } from "@/lib/assets";
import { school } from "@/lib/school";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About our school — Rahma Junior Education Center" },
      {
        name: "description",
        content:
          "Learn about Rahma Junior Education Center: our mission, values and the caring team that guides every learner's foundation.",
      },
      { property: "og:title", content: "About Rahma Junior Education Center" },
      {
        property: "og:description",
        content: "Our mission, values and the team behind a strong educational foundation.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-brand text-primary">About us</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-navy">
          {school.name}
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          {school.shortName} exists to give young children a secure, joyful place to build the
          skills and character they will carry for life. Our teachers combine the Competency Based
          Curriculum with close personal attention, so every learner is known, supported and
          stretched.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Our mission",
              body: "To provide the best foundation of education for young children through skilled teaching and genuine care.",
            },
            {
              title: "Our vision",
              body: "A community of confident, curious learners who lead with integrity wherever life takes them.",
            },
            { title: "Our values", body: school.values },
          ].map((c) => (
            <Card key={c.title} className="border-border/70 shadow-panel">
              <CardContent className="pt-6">
                <h2 className="font-display text-base font-semibold text-navy">{c.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryPhotos.slice(4, 10).map((g) => (
            <figure key={g.url}>
              <img
                src={g.url}
                alt={g.caption}
                loading="lazy"
                className="h-52 w-full rounded-2xl object-cover shadow-panel"
              />
              <figcaption className="mt-2 text-xs text-muted-foreground">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
