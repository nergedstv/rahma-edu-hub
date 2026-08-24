import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { dayNames } from "@/lib/school";

export const Route = createFileRoute("/_authenticated/portal/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable | Rahma Junior portal" },
      { name: "description", content: "Weekly lesson timetable for each class." },
      { property: "og:title", content: "Timetable | Rahma Junior portal" },
      { property: "og:description", content: "Weekly lesson timetable for each class." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const [classId, setClassId] = useState("");

  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id,name,section")
        .order("level_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const entries = useQuery({
    queryKey: ["timetable", classId],
    enabled: Boolean(classId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select("id,day_of_week,starts_at,ends_at,room,subject_name,subjects:subject_id(name)")
        .eq("class_id", classId)
        .order("day_of_week")
        .order("starts_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const byDay = [1, 2, 3, 4, 5].map((d) => ({
    day: d,
    rows: (entries.data ?? []).filter((e) => e.day_of_week === d),
  }));

  return (
    <div>
      <PageHeader title="Timetable" description="Lesson schedule for the school week." />

      <Card>
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="max-w-xs space-y-2">
            <Label>Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {(classes.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.section ? ` — ${c.section}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!classId ? (
            <EmptyState message="Select a class to see its timetable." />
          ) : (entries.data ?? []).length === 0 ? (
            <EmptyState message="No timetable entries for this class yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {byDay.map(({ day, rows }) => (
                <div key={day} className="rounded-md border border-border">
                  <p className="border-b border-border bg-secondary/50 px-3 py-2 text-xs font-bold uppercase tracking-brand text-navy">
                    {dayNames[day]}
                  </p>
                  <ul className="divide-y divide-border">
                    {rows.length === 0 ? (
                      <li className="px-3 py-3 text-xs text-muted-foreground">No lessons</li>
                    ) : (
                      rows.map((r) => {
                        const subject = (r.subjects as { name?: string } | null)?.name;
                        return (
                          <li key={r.id} className="px-3 py-2">
                            <p className="text-sm font-medium text-navy">
                              {subject ?? r.subject_name ?? "Lesson"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.starts_at.slice(0, 5)}–{r.ends_at.slice(0, 5)}
                              {r.room ? ` · ${r.room}` : ""}
                            </p>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
