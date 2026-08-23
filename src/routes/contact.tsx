import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
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

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Rahma Junior Education Center" },
      {
        name: "description",
        content:
          "Get in touch with Rahma Junior Education Center: phone, email and a message form for admissions and general enquiries.",
      },
      { property: "og:title", content: "Contact Rahma Junior Education Center" },
      {
        property: "og:description",
        content: "Phone, email and an online message form for parents and visitors.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("contact_enquiries").insert({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        message: form.message,
      });
      if (error) throw error;
      toast.success("Message sent. We will reply soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  }

  const details = [
    { icon: Phone, label: "Phone", value: school.phone },
    { icon: Mail, label: "Email", value: school.email },
    { icon: MapPin, label: "Location", value: school.location },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-brand text-primary">Contact</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-navy">
          We would love to hear from you
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Questions about admissions, fees or the school day? Send us a message and our office will
          get back to you.
        </p>

        <section className="mt-12 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-4">
            {details.map((d) => (
              <Card key={d.label} className="border-border/70 shadow-panel">
                <CardContent className="flex items-start gap-4 pt-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <d.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-brand text-muted-foreground">
                      {d.label}
                    </p>
                    <p className="mt-1 text-sm font-medium break-all text-navy">{d.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/70 shadow-panel">
            <CardContent className="pt-6">
              <h2 className="font-display text-xl font-bold text-navy">Send a message</h2>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cphone">Phone</Label>
                    <Input
                      id="cphone"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cemail">Email</Label>
                  <Input
                    id="cemail"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                  {busy ? "Sending…" : "Send message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
