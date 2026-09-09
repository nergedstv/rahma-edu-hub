import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { createStudentRecord } from "@/lib/students.functions";

const RELATIONSHIPS = ["mother", "father", "guardian", "parent"];

const emptyForm = {
  admissionNo: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  classId: "",
  admissionDate: "",
  medicalNotes: "",
  parentFirstName: "",
  parentLastName: "",
  parentPhone: "",
  parentEmail: "",
  relationship: "mother",
  parentPassword: "",
};

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();
  const submit = useServerFn(createStudentRecord);

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const classes = useQuery({
    queryKey: ["classes-picker"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id,name,section,level_order")
        .order("level_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: async () =>
      submit({
        data: {
          admissionNo: form.admissionNo.trim() || null,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dateOfBirth: form.dateOfBirth || null,
          gender: form.gender ? (form.gender as "male" | "female") : null,
          classId: form.classId || null,
          admissionDate: form.admissionDate || null,
          medicalNotes: form.medicalNotes.trim() || null,
          parent: {
            firstName: form.parentFirstName.trim(),
            lastName: form.parentLastName.trim(),
            phone: form.parentPhone.trim(),
            email: form.parentEmail.trim() || null,
            relationship: form.relationship,
            password: form.parentPassword.trim() || null,
          },
        },
      }),
    onSuccess: (res) => {
      toast.success(
        res.parentAccountCreated
          ? `Student ${res.admissionNo} added and a parent login was created`
          : res.parentLinked
            ? `Student ${res.admissionNo} added and linked to the parent account`
            : `Student ${res.admissionNo} added`,
      );
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-picker"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      setForm(emptyForm);
      setOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not add the student"),
  });

  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.parentFirstName.trim() &&
    form.parentLastName.trim() &&
    form.parentPhone.trim().length >= 5 &&
    (!form.parentPassword || (form.parentEmail.trim() && form.parentPassword.length >= 8));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <GraduationCap className="mr-2 size-4" /> Add student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a student</DialogTitle>
          <DialogDescription>
            Record the learner and their parent or guardian. With an email and password the parent
            gets a login straight away and sees this learner in their portal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <section className="grid gap-4">
            <h3 className="text-sm font-semibold text-navy">Learner details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="sfn">First name</Label>
                <Input
                  id="sfn"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sln">Last name</Label>
                <Input
                  id="sln"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="adm">Admission number</Label>
                <Input
                  id="adm"
                  value={form.admissionNo}
                  onChange={(e) => set("admissionNo", e.target.value)}
                  placeholder="Leave blank to generate"
                />
              </div>
              <div className="grid gap-2">
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => set("classId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.section ? ` ${c.section}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admdate">Admission date</Label>
                <Input
                  id="admdate"
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) => set("admissionDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="med">Medical notes</Label>
              <Textarea
                id="med"
                rows={2}
                value={form.medicalNotes}
                onChange={(e) => set("medicalNotes", e.target.value)}
                placeholder="Allergies, conditions, medication"
              />
            </div>
          </section>

          <section className="grid gap-4 rounded-lg border border-border bg-muted/40 p-4">
            <h3 className="text-sm font-semibold text-navy">Parent / guardian</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pfn">First name</Label>
                <Input
                  id="pfn"
                  value={form.parentFirstName}
                  onChange={(e) => set("parentFirstName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pln">Last name</Label>
                <Input
                  id="pln"
                  value={form.parentLastName}
                  onChange={(e) => set("parentLastName", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pph">Phone</Label>
                <Input
                  id="pph"
                  value={form.parentPhone}
                  onChange={(e) => set("parentPhone", e.target.value)}
                  placeholder="07xx xxx xxx"
                />
              </div>
              <div className="grid gap-2">
                <Label>Relationship</Label>
                <Select value={form.relationship} onValueChange={(v) => set("relationship", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pem">Email (for parent login)</Label>
                <Input
                  id="pem"
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => set("parentEmail", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ppw">Temporary password</Label>
                <Input
                  id="ppw"
                  value={form.parentPassword}
                  onChange={(e) => set("parentPassword", e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              If the parent already has an account with that email, this learner is simply added to
              it. Leave both blank to record contact details only.
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={!valid || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
