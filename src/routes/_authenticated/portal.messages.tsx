import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fullName } from "@/lib/school";

export const Route = createFileRoute("/_authenticated/portal/messages")({
  head: () => ({
    meta: [
      { title: "Messages | Rahma Junior portal" },
      { name: "description", content: "Direct messages between staff, parents and learners." },
      { property: "og:title", content: "Messages | Rahma Junior portal" },
      {
        property: "og:description",
        content: "Direct messages between staff, parents and learners.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MessagesPage,
});

type MessageRow = {
  id: string;
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender: { first_name: string; last_name: string } | null;
  recipient: { first_name: string; last_name: string } | null;
};

function MessagesPage() {
  const { userId } = useMe();
  const queryClient = useQueryClient();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const people = useQuery({
    queryKey: ["message-people"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,first_name,last_name")
        .eq("is_active", true)
        .order("first_name");
      if (error) throw error;
      return (data ?? []).filter((p) => p.id !== userId);
    },
  });

  const messages = useQuery({
    queryKey: ["messages", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          "id,subject,body,read_at,created_at,sender_id,recipient_id,sender:sender_id(first_name,last_name),recipient:recipient_id(first_name,last_name)",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as MessageRow[];
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId!,
        recipient_id: recipient,
        subject: subject.trim() || null,
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message sent");
      setSubject("");
      setBody("");
      setRecipient("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not send message"),
  });

  const all = messages.data ?? [];
  const inbox = all.filter((m) => m.recipient_id === userId);
  const sent = all.filter((m) => m.sender_id === userId);

  function renderList(rows: MessageRow[], mode: "inbox" | "sent") {
    if (messages.isLoading) return <EmptyState message="Loading messages…" />;
    if (rows.length === 0)
      return (
        <EmptyState
          message={mode === "inbox" ? "Your inbox is empty." : "You have not sent any messages."}
        />
      );
    return (
      <div className="space-y-3">
        {rows.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-navy">
                  {mode === "inbox"
                    ? `From ${fullName(m.sender) || "School"}`
                    : `To ${fullName(m.recipient) || "Recipient"}`}
                </p>
                <span className="text-[11px] uppercase tracking-brand text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              {m.subject ? (
                <p className="mt-1 text-sm font-medium text-foreground">{m.subject}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">{m.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Messages" description="Private messages within the school community." />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox">Inbox ({inbox.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="mt-4">
            {renderList(inbox, "inbox")}
          </TabsContent>
          <TabsContent value="sent" className="mt-4">
            {renderList(sent, "sent")}
          </TabsContent>
        </Tabs>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">New message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {(people.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {fullName(p) || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg-subject">Subject</Label>
              <Input
                id="msg-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg-body">Message</Label>
              <Textarea
                id="msg-body"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              disabled={!recipient || !body.trim() || send.isPending}
              onClick={() => send.mutate()}
            >
              {send.isPending ? "Sending…" : "Send message"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
