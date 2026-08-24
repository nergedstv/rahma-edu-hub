import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fullName } from "@/lib/school";

type Status = "present" | "absent" | "late" | "excused";
const statuses: Status[] = ["present", "absent", "late", "excused"];

export const Route = createFileRoute("/_authenticated/portal/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance | Rahma Junior portal" },
      { name: "description", content: "Mark and review daily class attendance." },
      { property: "og:title", content: "Attendance | Rahma Junior portal" },
      { property: "og:description", content: "Mark and review daily class attendance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { userId } = useMe();
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

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

  const roster = useQuery({
    queryKey: ["roster", classId, date],
    enabled: Boolean(classId),
    queryFn: async () => {
      const [{ data: studs, error }, { data: recs }] = await Promise.all([
        supabase
          .from("students")
          .select("id,first_name,last_name,admission_no")
          .eq("current_class_id", classId)
          .order("first_name"),
        supabase
          .from("attendance_records")
          .select("student_id,status")
          .eq("class_id", classId)
          .eq("attendance_date", date),
      ]);
      if (error) throw error;
      const marks = new Map((recs ?? []).map((r) => [r.student_id, r.status as Status]));
      return (studs ?? []).map((s) => ({ ...s, status: marks.get(s.id) ?? null }));
    },
  });

  const [draft, setDraft] = useState<Record<string, Status>>({});

  async function save() {
    const entries = Object.entries(draft);
    if (entries.length === 0) {
      toast.info("Nothing to save yet.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("attendance_records").insert(
      entries.map(([student_id, status]) => ({
        student_id,
        class_id: classId,
        attendance_date: date,
        status,
        marked_by: userId ?? null,
      })),
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Attendance saved.");
    setDraft({});
    queryClient.invalidateQueries({ queryKey: ["roster"] });
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Choose a class and date, then mark each learner."
        actions={
          <Button onClick={save} disabled={saving || !classId}>
            {saving ? "Saving…" : "Save attendance"}
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {!classId ? (
            <EmptyState message="Select a class to load its register." />
          ) : roster.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (roster.data ?? []).length === 0 ? (
            <EmptyState message="No students in this class yet." />
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {roster.data!.map((s) => {
                const current = draft[s.id] ?? s.status;
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy">{fullName(s)}</p>
                      <p className="font-mono text-xs text-muted-foreground">{s.admission_no}</p>
                    </div>
                    <div className="flex gap-1">
                      {statuses.map((st) => (
                        <Button
                          key={st}
                          type="button"
                          size="sm"
                          variant={current === st ? "default" : "outline"}
                          onClick={() => setDraft((d) => ({ ...d, [s.id]: st }))}
                          className="capitalize"
                        >
                          {st}
                        </Button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
