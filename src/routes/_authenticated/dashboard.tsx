import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardCheck, GraduationCap, Megaphone, Wallet } from "lucide-react";

import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fullName, money, roleLabels } from "@/lib/school";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Portal dashboard | Rahma Junior Education Center" },
      {
        name: "description",
        content:
          "Your Rahma Junior Education Center portal overview: students, attendance, fees and announcements.",
      },
      { property: "og:title", content: "Portal dashboard | Rahma Junior" },
      {
        property: "og:description",
        content: "Sign in to view students, attendance, fees and school announcements.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-brand text-muted-foreground">{label}</p>
          <p className="font-display text-xl font-extrabold text-navy">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { profile, primaryRole, isStaff, userId } = useMe();

  const stats = useQuery({
    queryKey: ["dashboard-stats", isStaff, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [students, classes, presentToday, invoices] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("classes").select("id", { count: "exact", head: true }),
        supabase
          .from("attendance_records")
          .select("id", { count: "exact", head: true })
          .eq("attendance_date", today)
          .eq("status", "present"),
        supabase.from("invoices").select("amount,status"),
      ]);
      const outstanding = (invoices.data ?? [])
        .filter((i) => i.status !== "paid")
        .reduce((sum, i) => sum + Number(i.amount ?? 0), 0);
      return {
        students: students.count ?? 0,
        classes: classes.count ?? 0,
        presentToday: presentToday.count ?? 0,
        outstanding,
      };
    },
  });

  const announcements = useQuery({
    queryKey: ["dashboard-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,body,published_at")
        .order("published_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const events = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id,title,starts_at,venue")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const s = stats.data;

  return (
    <div>
      <PageHeader
        title={`Welcome back${profile?.first_name ? `, ${profile.first_name}` : ""}`}
        description={`You are signed in as ${roleLabels[primaryRole]}${
          profile ? ` — ${fullName(profile)}` : ""
        }.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={String(s?.students ?? 0)} icon={GraduationCap} />
        <StatCard label="Classes" value={String(s?.classes ?? 0)} icon={CalendarDays} />
        <StatCard label="Present today" value={String(s?.presentToday ?? 0)} icon={ClipboardCheck} />
        <StatCard label="Fees outstanding" value={money(s?.outstanding ?? 0)} icon={Wallet} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="size-4 text-primary" /> Latest announcements
            </CardTitle>
            <CardDescription>
              <Link to="/portal/announcements" className="text-primary hover:underline">
                View all announcements
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(announcements.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              announcements.data!.map((a) => (
                <div key={a.id} className="rounded-md border border-border/70 p-3">
                  <p className="text-sm font-semibold text-navy">{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4 text-primary" /> Upcoming events
            </CardTitle>
            <CardDescription>School calendar highlights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(events.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              events.data!.map((e) => (
                <div key={e.id} className="rounded-md border border-border/70 p-3">
                  <p className="text-sm font-semibold text-navy">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.starts_at).toLocaleString()} {e.venue ? `· ${e.venue}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
