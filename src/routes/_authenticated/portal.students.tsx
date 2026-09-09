import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AddStudentDialog } from "@/components/portal/add-student-dialog";
import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fullName } from "@/lib/school";

export const Route = createFileRoute("/_authenticated/portal/students")({
  head: () => ({
    meta: [
      { title: "Students | Rahma Junior portal" },
      { name: "description", content: "Student register for Rahma Junior Education Center." },
      { property: "og:title", content: "Students | Rahma Junior portal" },
      { property: "og:description", content: "Student register and admission details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const [q, setQ] = useState("");

  const students = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(
          "id,admission_no,first_name,last_name,gender,status,admission_date,classes:current_class_id(name,section)",
        )
        .order("first_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = (students.data ?? []).filter((s) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return `${s.first_name} ${s.last_name} ${s.admission_no}`.toLowerCase().includes(needle);
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="Every learner enrolled at Rahma Junior Education Center."
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or admission number"
            className="mb-4 max-w-sm"
          />

          {students.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <EmptyState message="No students found." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adm. no</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => {
                    const cls = s.classes as { name?: string; section?: string | null } | null;
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.admission_no}</TableCell>
                        <TableCell className="font-medium text-navy">{fullName(s)}</TableCell>
                        <TableCell>
                          {cls?.name ? `${cls.name}${cls.section ? ` ${cls.section}` : ""}` : "—"}
                        </TableCell>
                        <TableCell className="capitalize">{s.gender ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "active" ? "default" : "secondary"}>
                            {s.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
