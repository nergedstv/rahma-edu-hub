import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMe } from "@/hooks/use-auth";
import { fullName, gradeFor } from "@/lib/school";
import { useMyChildren, useMyStudent, useStudentMarks, type MarkRow } from "@/lib/portal-data";

export const Route = createFileRoute("/_authenticated/portal/results")({
  head: () => ({
    meta: [
      { title: "Exam results | Rahma Junior portal" },
      { name: "description", content: "View published exam marks, grades and teacher remarks." },
      { property: "og:title", content: "Exam results | Rahma Junior portal" },
      { property: "og:description", content: "Published exam marks, grades and remarks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultsPage,
});

function MarksByExam({ marks }: { marks: MarkRow[] }) {
  const groups = new Map<string, MarkRow[]>();
  for (const m of marks) {
    const list = groups.get(m.examName) ?? [];
    list.push(m);
    groups.set(m.examName, list);
  }
  if (groups.size === 0) return <EmptyState message="No published results yet." />;

  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([exam, rows]) => {
        const total = rows.reduce((s, r) => s + r.marks, 0);
        const max = rows.reduce((s, r) => s + r.maxMarks, 0);
        return (
          <Card key={exam}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{exam}</CardTitle>
              <Badge variant="secondary">
                {total}/{max} · {gradeFor(total, max)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-navy">{r.subject}</TableCell>
                        <TableCell>
                          {r.marks}/{r.maxMarks}
                        </TableCell>
                        <TableCell>{r.grade ?? gradeFor(r.marks, r.maxMarks)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.teacher_remarks ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ResultsPage() {
  const { userId, hasRole } = useMe();
  const isParent = hasRole("parent");
  const myStudent = useMyStudent(isParent ? undefined : userId);
  const children = useMyChildren(isParent ? userId : undefined);
  const [childId, setChildId] = useState<string>("");

  const selected = isParent
    ? childId || children.data?.[0]?.id
    : myStudent.data?.id;
  const marks = useStudentMarks(selected);

  return (
    <div>
      <PageHeader
        title="Exam results"
        description="Published marks per exam, with grades and teacher remarks."
      />

      {isParent ? (
        <div className="mb-4 max-w-xs">
          <Select value={selected ?? ""} onValueChange={setChildId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {(children.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {fullName(c)} · {c.admission_no}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {!selected ? (
        <EmptyState
          message={
            isParent
              ? "No children are linked to your account yet. Please contact the school office."
              : "Your login is not linked to a student record yet. Please contact the school office."
          }
        />
      ) : marks.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <MarksByExam marks={marks.data ?? []} />
      )}
    </div>
  );
}
