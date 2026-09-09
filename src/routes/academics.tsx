import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics & CBC — Rahma Junior Education Center" },
      {
        name: "description",
        content:
          "Our CBC-aligned programme from playgroup to junior school (Grade 9): learning areas, assessment and how progress is shared with parents.",
      },
      { property: "og:title", content: "Academics & CBC — Rahma Junior" },
      {
        property: "og:description",
        content: "Learning areas, assessment and progress reporting at Rahma Junior.",
      },
    ],
  }),
  component: Academics,
});

const levels = [
  { name: "Playgroup, PP1–PP2 (Pre-primary)", body: "Play-based literacy, numeracy and social skills." },
  { name: "Grade 1–3 (Lower primary)", body: "Reading fluency, number work, environmental studies." },
  { name: "Grade 4–6 (Upper primary)", body: "Subject depth, projects and skill pathways." },
  { name: "Grade 7–9 (Junior school)", body: "Pre-technical studies, integrated science and pathway discovery." },
];


const learningAreas = [
  "Literacy & English",
  "Kiswahili",
  "Mathematics",
  "Environmental Activities",
  "Science & Technology",
  "Islamic Religious Education",
  "Creative Arts",
  "Physical & Health Education",
  "Computer Studies",
];

function Academics() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-brand text-primary">Academics</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-navy">
          Competency Based Curriculum, delivered with care
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Learners are assessed continuously through CATs, mid-term and end-term exams. Results,
          teacher remarks and attendance are published to parents in the portal as soon as they are
          approved.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {levels.map((l) => (
            <Card key={l.name} className="border-border/70 shadow-panel">
              <CardContent className="pt-6">
                <h2 className="font-display text-base font-semibold text-navy">{l.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{l.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold text-navy">Learning areas</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {learningAreas.map((a) => (
            <li
              key={a}
              className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground"
            >
              <CheckCircle2 className="size-4 text-primary" /> {a}
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
