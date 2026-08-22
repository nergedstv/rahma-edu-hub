import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, HeartHandshake, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { galleryPhotos, heroPhotos } from "@/lib/assets";
import { useI18n } from "@/lib/i18n";
import { school } from "@/lib/school";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rahma Junior Education Center — Foundation for Knowledge" },
      {
        name: "description",
        content:
          "Rahma Junior Education Center offers a nurturing CBC-aligned foundation for young learners, with a parent and staff portal for results, fees and attendance.",
      },
      { property: "og:title", content: "Rahma Junior Education Center" },
      {
        property: "og:description",
        content: "A nurturing, CBC-aligned foundation of education for young children.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    icon: BookOpen,
    title: "CBC-aligned learning",
    body: "Competency Based Curriculum delivered by trained teachers who track every learner's progress.",
  },
  {
    icon: HeartHandshake,
    title: "Care and character",
    body: "Dedication, efficiency, integrity and team work shape how we teach and how our pupils grow.",
  },
  {
    icon: Users,
    title: "Parents in the loop",
    body: "Attendance, exam results, fee statements and messages available any time in the parent portal.",
  },
  {
    icon: GraduationCap,
    title: "Strong foundation",
    body: "From playgroup through upper primary, learners build the confidence to thrive at the next level.",
  },
];

function Home() {
  const { t } = useI18n();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % heroPhotos.length), 5200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy text-navy-foreground">
          <div className="absolute inset-0">
            {heroPhotos.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden
                className={cn(
                  "absolute inset-0 size-full object-cover transition-opacity duration-1000",
                  i === slide ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/40" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-brand text-accent">
              <Sparkles className="size-3.5" /> {t("heroEyebrow")}
            </p>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-tight md:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base text-navy-foreground/85 md:text-lg">
              {t("heroLead")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/admissions">{t("apply")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-navy-foreground hover:bg-white/10"
              >
                <Link to="/about">{t("discover")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-brand text-primary">
              Why Rahma Junior
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy md:text-4xl">
              A school built around every learner
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <Card key={p.title} className="border-border/70 shadow-panel">
                <CardContent className="pt-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-navy">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Portal band */}
        <section className="bg-pearl py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-brand text-primary">
                One portal, five roles
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy md:text-4xl">
                Administration, teaching and parenting in one place
              </h2>
              <p className="mt-4 text-sm text-muted-foreground md:text-base">
                Administrators manage admissions, classes, fees and inventory. Teachers mark
                attendance, share notes and enter exam marks. Parents and pupils follow results,
                statements and school announcements — securely, on any device.
              </p>
              <Button asChild size="lg" className="mt-7">
                <Link to="/auth">{t("login")}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {galleryPhotos.slice(0, 4).map((g) => (
                <img
                  key={g.url}
                  src={g.url}
                  alt={g.caption}
                  loading="lazy"
                  className="h-40 w-full rounded-2xl object-cover shadow-lift md:h-48"
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
            Ready to join the {school.shortName} family?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Send an admission enquiry and our office will get back to you with the next steps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/admissions">{t("apply")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">{t("contact")}</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
