import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/portal/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements | Rahma Junior portal" },
      { name: "description", content: "School announcements for staff, parents and learners." },
      { property: "og:title", content: "Announcements | Rahma Junior portal" },
      {
        property: "og:description",
        content: "School announcements for staff, parents and learners.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnnouncementsPage,
});

const audiences = ["all", "staff", "parents", "students"] as const;

function AnnouncementsPage() {
  const { isAdmin, userId } = useMe();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<string>("all");

  const list = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,body,audience,published_at")
        .order("published_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("announcements").insert({
        title: title.trim(),
        body: body.trim(),
        audience,
        published_by: userId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Announcement published");
      setTitle("");
      setBody("");
      setAudience("all");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not publish announcement"),
  });

  const rows = list.data ?? [];

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Notices shared with the school community."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {list.isLoading ? (
            <EmptyState message="Loading announcements…" />
          ) : rows.length === 0 ? (
            <EmptyState message="No announcements published yet." />
          ) : (
            rows.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-navy">{a.title}</h2>
                    <Badge variant="secondary" className="capitalize">
                      {a.audience}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] uppercase tracking-brand text-muted-foreground">
                    {new Date(a.published_at).toLocaleString()}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm text-foreground/80">{a.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {isAdmin ? (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">New announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ann-title">Title</Label>
                <Input
                  id="ann-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Term 2 opening day"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ann-body">Message</Label>
                <Textarea
                  id="ann-body"
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share the details…"
                />
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={!title.trim() || !body.trim() || create.isPending}
                onClick={() => create.mutate()}
              >
                {create.isPending ? "Publishing…" : "Publish"}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
