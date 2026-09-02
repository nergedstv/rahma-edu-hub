import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { createPortalUser } from "@/lib/admin-users.functions";
import { APP_ROLES, fullName, roleLabels, type AppRole } from "@/lib/school";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<AppRole>("teacher");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [studentId, setStudentId] = useState("");
  const [childIds, setChildIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const create = useServerFn(createPortalUser);

  const students = useQuery({
    queryKey: ["students-picker"],
    enabled: open && (role === "student" || role === "parent"),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,first_name,last_name,admission_no,user_id")
        .order("first_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: async () =>
      create({
        data: {
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim() || null,
          role,
          studentId: role === "student" ? studentId || null : null,
          childIds: role === "parent" ? childIds : [],
        },
      }),
    onSuccess: () => {
      toast.success(`${roleLabels[role]} account created`);
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
      setStudentId("");
      setChildIds([]);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not create the account"),
  });

  const valid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.password.length >= 8 &&
    (role !== "student" || studentId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 size-4" /> Add user
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a portal account</DialogTitle>
          <DialogDescription>
            The account is ready immediately — share the email and password with the person, and they
            will land on the portal for their role.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fn">First name</Label>
              <Input
                id="fn"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ln">Last name</Label>
              <Input
                id="ln"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="em">Email</Label>
            <Input
              id="em"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ph">Phone</Label>
              <Input
                id="ph"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw">Temporary password</Label>
              <Input
                id="pw"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          {role === "student" ? (
            <div className="grid gap-2">
              <Label>Link to student record</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {(students.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {fullName(s)} · {s.admission_no}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Students must exist in the Students register first.
              </p>
            </div>
          ) : null}

          {role === "parent" ? (
            <div className="grid gap-2">
              <Label>Children</Label>
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                {(students.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students in the register yet.</p>
                ) : (
                  students.data!.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={childIds.includes(s.id)}
                        onCheckedChange={(c) =>
                          setChildIds((prev) =>
                            c ? [...prev, s.id] : prev.filter((id) => id !== s.id),
                          )
                        }
                      />
                      {fullName(s)} · {s.admission_no}
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!valid || mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
