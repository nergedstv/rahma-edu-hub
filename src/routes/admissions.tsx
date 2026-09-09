import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { school } from "@/lib/school";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — Rahma Junior Education Center" },
      {
        name: "description",
        content:
          "Apply for a place at Rahma Junior Education Center. Simple three-step admission for Playgroup through Grade 6.",
      },
      { property: "og:title", content: "Admissions at Rahma Junior Education Center" },
      {
        property: "og:description",
        content: "Send an application online and our admissions team will contact you.",
      },
    ],
  }),
  component: Admissions,
});

const classOptions = [
  "Playgroup",
  "PP1",
  "PP2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
];


const steps = [
  { title: "1. Send the form", body: "Share your child's details and the class you are applying for." },
  { title: "2. Meet the team", body: "We invite you for a short visit and a friendly readiness chat." },
  { title: "3. Confirm the place", body: "Complete registration and receive the term joining pack." },
];

function Admissions() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    child_name: "",
    child_dob: "",
    class_applying_for: classOptions[0]!,
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    notes: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("applications").insert({
        child_name: form.child_name,
        child_dob: form.child_dob || null,
        class_applying_for: form.class_applying_for,
        parent_name: form.parent_name,
        parent_phone: form.parent_phone,
        parent_email: form.parent_email || null,
        notes: form.notes || null,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Application received. We will call you shortly.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the application");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-brand text-primary">Admissions</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-navy">
          Join the {school.shortName} family
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          We welcome learners from Playgroup through Grade 6 throughout the year. Send the form below
          and our admissions team will get in touch with the next steps.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.title} className="border-border/70 shadow-panel">
              <CardContent className="pt-6">
                <h2 className="font-display text-base font-semibold text-navy">{s.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="border-border/70 shadow-panel">
            <CardContent className="pt-6">
              <h2 className="font-display text-xl font-bold text-navy">Application form</h2>
              {sent ? (
                <div className="mt-6 rounded-lg bg-secondary p-6">
                  <p className="font-semibold text-navy">Thank you!</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your application has been received. Our admissions office will contact you on the
                    phone number you provided.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>
                    Send another application
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="child">Child's full name</Label>
                      <Input
                        id="child"
                        value={form.child_name}
                        onChange={(e) => set("child_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dob">Date of birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={form.child_dob}
                        onChange={(e) => set("child_dob", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="class">Class applying for</Label>
                    <select
                      id="class"
                      value={form.class_applying_for}
                      onChange={(e) => set("class_applying_for", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {classOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="parent">Parent / guardian name</Label>
                      <Input
                        id="parent"
                        value={form.parent_name}
                        onChange={(e) => set("parent_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pphone">Phone number</Label>
                      <Input
                        id="pphone"
                        inputMode="tel"
                        value={form.parent_phone}
                        onChange={(e) => set("parent_phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pemail">Email (optional)</Label>
                    <Input
                      id="pemail"
                      type="email"
                      value={form.parent_email}
                      onChange={(e) => set("parent_email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Anything we should know?</Label>
                    <Textarea
                      id="notes"
                      rows={4}
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                    {busy ? "Sending…" : "Submit application"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-navy text-navy-foreground shadow-panel">
            <CardContent className="pt-6">
              <h2 className="font-display text-lg font-bold">Talk to admissions</h2>
              <p className="mt-2 text-sm opacity-85">
                Prefer to speak with us? Our office is happy to answer any question about fees,
                uniform or the school day.
              </p>
              <dl className="mt-6 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-brand text-accent">Phone</dt>
                  <dd>{school.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-brand text-accent">Email</dt>
                  <dd className="break-all">{school.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-brand text-accent">Visit</dt>
                  <dd>{school.location}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
