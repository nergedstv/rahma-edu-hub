import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fullName, initials, roleLabels } from "@/lib/school";

export const Route = createFileRoute("/_authenticated/portal/profile")({
  head: () => ({
    meta: [
      { title: "My profile | Rahma Junior portal" },
      { name: "description", content: "Update your contact details and portal account." },
      { property: "og:title", content: "My profile | Rahma Junior portal" },
      { property: "og:description", content: "Update your contact details and portal account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, roles, userId, user } = useMe();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile?.first_name, profile?.last_name, profile?.phone]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim() || null,
        })
        .eq("id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save profile"),
  });

  const name = fullName(profile) || "Portal user";

  return (
    <div>
      <PageHeader title="My profile" description="Your account details in the school portal." />

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {initials(name)}
            </span>
            <p className="mt-4 font-display text-lg font-bold text-navy">{name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email ?? user?.email ?? "—"}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {roles.length === 0 ? (
                <Badge variant="secondary">No role assigned</Badge>
              ) : (
                roles.map((r) => (
                  <Badge key={r} variant="secondary">
                    {roleLabels[r]}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first">First name</Label>
                <Input
                  id="first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? user?.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">
                Contact an administrator to change your sign-in email.
              </p>
            </div>
            <Button
              disabled={!firstName.trim() || !lastName.trim() || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
