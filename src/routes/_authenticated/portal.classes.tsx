import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/portal/classes")({
  head: () => ({
    meta: [
      { title: "Classes | Rahma Junior portal" },
      { name: "description", content: "Class list, streams and capacity at Rahma Junior." },
      { property: "og:title", content: "Classes | Rahma Junior portal" },
      { property: "og:description", content: "Class list, streams and capacity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const classes = useQuery({
    queryKey: ["classes-with-counts"],
    queryFn: async () => {
      const [{ data: cls, error }, { data: studs }] = await Promise.all([
        supabase
          .from("classes")
          .select("id,name,section,level_order,capacity")
          .order("level_order"),
        supabase.from("students").select("id,current_class_id"),
      ]);
      if (error) throw error;
      const counts = new Map<string, number>();
      for (const s of studs ?? []) {
        if (s.current_class_id) counts.set(s.current_class_id, (counts.get(s.current_class_id) ?? 0) + 1);
      }
      return (cls ?? []).map((c) => ({ ...c, enrolled: counts.get(c.id) ?? 0 }));
    },
  });

  return (
    <div>
      <PageHeader title="Classes" description="Grades, streams and current enrolment." />

      {classes.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (classes.data ?? []).length === 0 ? (
        <EmptyState message="No classes have been created yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.data!.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-navy">
                  {c.name}
                  {c.section ? ` — ${c.section}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">{c.enrolled}</span> enrolled
                  {c.capacity ? ` of ${c.capacity} places` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
