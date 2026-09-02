import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  Percent,
  Wallet,
} from "lucide-react";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { dayNames, fullName, gradeFor, money, roleLabels } from "@/lib/school";
import {
  useAnnouncementFeed,
  useClassTimetable,
  useMyChildren,
  useMyStudent,
  useStudentMarks,
  useStudentSummary,
  useUpcomingEvents,
  type StudentRow,
} from "@/lib/portal-data";

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

function AnnouncementsCard() {
  const announcements = useAnnouncementFeed();
  return (
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
  );
}

function EventsCard({ title = "School calendar" }: { title?: string }) {
  const events = useUpcomingEvents();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-primary" /> Upcoming events
        </CardTitle>
        <CardDescription>{title} — opening and closing days, meetings and more</CardDescription>
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
  );
}

function StaffDashboard() {
  const { userId, isStaff } = useMe();
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
  const s = stats.data;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={String(s?.students ?? 0)} icon={GraduationCap} />
        <StatCard label="Classes" value={String(s?.classes ?? 0)} icon={CalendarDays} />
        <StatCard label="Present today" value={String(s?.presentToday ?? 0)} icon={ClipboardCheck} />
        <StatCard label="Fees outstanding" value={money(s?.outstanding ?? 0)} icon={Wallet} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnnouncementsCard />
        <EventsCard />
      </div>
    </>
  );
}

function StudentDashboard() {
  const { userId } = useMe();
  const student = useMyStudent(userId);
  const summary = useStudentSummary(student.data?.id);
  const marks = useStudentMarks(student.data?.id);
  const timetable = useClassTimetable(student.data?.current_class_id);
  const today = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todayLessons = (timetable.data ?? []).filter((l) => l.day === today);
  const recent = (marks.data ?? []).slice(0, 6);

  if (student.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!student.data)
    return (
      <EmptyState message="Your login is not linked to a student record yet. Please contact the school office." />
    );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Admission no." value={student.data.admission_no} icon={GraduationCap} />
        <StatCard
          label="Attendance"
          value={summary.data?.attendanceRate == null ? "—" : `${summary.data.attendanceRate}%`}
          icon={Percent}
        />
        <StatCard label="Fee balance" value={money(summary.data?.balance ?? 0)} icon={Wallet} />
        <StatCard label="Subjects graded" value={String(marks.data?.length ?? 0)} icon={ClipboardCheck} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent results</CardTitle>
            <CardDescription>
              <Link to="/portal/results" className="text-primary hover:underline">
                View all results
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No published results yet.</p>
            ) : (
              recent.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-border/70 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">{m.subject}</p>
                    <p className="text-xs text-muted-foreground">{m.examName}</p>
                  </div>
                  <Badge variant="secondary">
                    {m.marks}/{m.maxMarks} · {m.grade ?? gradeFor(m.marks, m.maxMarks)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s timetable</CardTitle>
            <CardDescription>{dayNames[today]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons scheduled for today.</p>
            ) : (
              todayLessons.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-md border border-border/70 p-3"
                >
                  <p className="text-sm font-semibold text-navy">{l.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.starts_at}–{l.ends_at} {l.room ? `· ${l.room}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnnouncementsCard />
        <EventsCard />
      </div>
    </>
  );
}

function ChildCard({ child }: { child: StudentRow }) {
  const summary = useStudentSummary(child.id);
  const marks = useStudentMarks(child.id);
  const latest = (marks.data ?? []).slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{fullName(child)}</CardTitle>
        <CardDescription>Admission no. {child.admission_no}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border/70 p-3">
            <p className="text-[11px] uppercase tracking-brand text-muted-foreground">Attendance</p>
            <p className="font-display text-lg font-extrabold text-navy">
              {summary.data?.attendanceRate == null ? "—" : `${summary.data.attendanceRate}%`}
            </p>
          </div>
          <div className="rounded-md border border-border/70 p-3">
            <p className="text-[11px] uppercase tracking-brand text-muted-foreground">Fee balance</p>
            <p className="font-display text-lg font-extrabold text-navy">
              {money(summary.data?.balance ?? 0)}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {latest.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published results yet.</p>
          ) : (
            latest.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-navy">
                  {m.subject} <span className="text-muted-foreground">· {m.examName}</span>
                </span>
                <Badge variant="secondary">
                  {m.marks}/{m.maxMarks} · {m.grade ?? gradeFor(m.marks, m.maxMarks)}
                </Badge>
              </div>
            ))
          )}
        </div>
        <Link to="/portal/results" className="text-sm text-primary hover:underline">
          View full results
        </Link>
      </CardContent>
    </Card>
  );
}

function ParentDashboard() {
  const { userId } = useMe();
  const children = useMyChildren(userId);

  return (
    <>
      {children.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (children.data ?? []).length === 0 ? (
        <EmptyState message="No children are linked to your account yet. Please contact the school office." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {children.data!.map((c) => (
            <ChildCard key={c.id} child={c} />
          ))}
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnnouncementsCard />
        <EventsCard />
      </div>
    </>
  );
}

function DashboardPage() {
  const { profile, primaryRole, isStaff, hasRole } = useMe();
  const isParent = hasRole("parent");
  const isStudent = hasRole("student");

  const description = isStaff
    ? "School-wide overview of students, attendance and fees."
    : isParent
      ? "Your children's attendance, results and fee balances."
      : "Your results, timetable, attendance and fee balance.";

  return (
    <div>
      <PageHeader
        title={`Welcome back${profile?.first_name ? `, ${profile.first_name}` : ""}`}
        description={`Signed in as ${roleLabels[primaryRole]}${
          profile ? ` — ${fullName(profile)}` : ""
        }. ${description}`}
      />
      {isStaff ? <StaffDashboard /> : isParent ? <ParentDashboard /> : isStudent ? <StudentDashboard /> : <StaffDashboard />}
    </div>
  );
}
