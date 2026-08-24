import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
import { supabase } from "@/integrations/supabase/client";
import { fullName, roleLabels, type AppRole } from "@/lib/school";

export const Route = createFileRoute("/_authenticated/portal/people")({
  head: () => ({
    meta: [
      { title: "Staff & parents | Rahma Junior portal" },
      { name: "description", content: "Directory of staff and parent accounts with their roles." },
      { property: "og:title", content: "Staff & parents | Rahma Junior portal" },
      { property: "og:description", content: "Directory of staff and parent accounts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  const [q, setQ] = useState("");

  const people = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id,first_name,last_name,email,phone,is_active").order("first_name"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (error) throw error;
      const map = new Map<string, AppRole[]>();
      for (const r of roles ?? []) {
        const list = map.get(r.user_id) ?? [];
        list.push(r.role as AppRole);
        map.set(r.user_id, list);
      }
      return (profiles ?? []).map((p) => ({ ...p, roles: map.get(p.id) ?? [] }));
    },
  });

  const rows = (people.data ?? []).filter((p) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return `${p.first_name} ${p.last_name} ${p.email ?? ""}`.toLowerCase().includes(needle);
  });

  return (
    <div>
      <PageHeader
        title="Staff & parents"
        description="Everyone with a portal account, and the roles they hold."
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="mb-4 max-w-sm"
          />
          {people.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <EmptyState message="No accounts found." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Roles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-navy">{fullName(p)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.email ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.phone ?? "—"}</TableCell>
                      <TableCell className="space-x-1">
                        {p.roles.length === 0 ? (
                          <span className="text-sm text-muted-foreground">No role</span>
                        ) : (
                          p.roles.map((r) => (
                            <Badge key={r} variant="secondary">
                              {roleLabels[r]}
                            </Badge>
                          ))
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
