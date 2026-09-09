import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  admissionNo: z.string().optional().nullable(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  classId: z.string().uuid().optional().nullable(),
  admissionDate: z.string().optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
  /** Parent / guardian details. */
  parent: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(5),
    email: z.string().email().optional().nullable(),
    relationship: z.string().min(1).default("parent"),
    /** When set (with an email), a parent login is created so they can view this learner. */
    password: z.string().min(8).optional().nullable(),
  }),
});

export const createStudentRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [{ data: isAdmin }, { data: isHead }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "headteacher" }),
    ]);
    if (!isAdmin && !isHead) {
      throw new Error("Forbidden: only administrators can add students.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Admission number: use the given one, otherwise generate the next in sequence.
    let admissionNo = data.admissionNo?.trim() || "";
    if (!admissionNo) {
      const year = new Date().getFullYear();
      const { count } = await supabaseAdmin
        .from("students")
        .select("id", { count: "exact", head: true });
      admissionNo = `RJ/${year}/${String((count ?? 0) + 1).padStart(4, "0")}`;
    }

    const parentName = `${data.parent.firstName.trim()} ${data.parent.lastName.trim()}`.trim();

    const { data: student, error: sErr } = await supabaseAdmin
      .from("students")
      .insert({
        admission_no: admissionNo,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender ?? null,
        current_class_id: data.classId || null,
        admission_date: data.admissionDate || new Date().toISOString().slice(0, 10),
        medical_notes: data.medicalNotes?.trim() || null,
        emergency_contact: `${parentName} (${data.parent.relationship})`,
        emergency_phone: data.parent.phone.trim(),
        status: "active",
      })
      .select("id,admission_no")
      .single();
    if (sErr) throw new Error(sErr.message);

    let parentId: string | null = null;
    let parentAccountCreated = false;
    const parentEmail = data.parent.email?.trim().toLowerCase() || "";

    if (parentEmail) {
      // Re-use an existing parent account when that email is already registered.
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", parentEmail)
        .maybeSingle();

      if (existing?.id) {
        parentId = existing.id;
      } else if (data.parent.password) {
        const created = await supabaseAdmin.auth.admin.createUser({
          email: parentEmail,
          password: data.parent.password,
          email_confirm: true,
          user_metadata: {
            first_name: data.parent.firstName.trim(),
            last_name: data.parent.lastName.trim(),
            phone: data.parent.phone.trim(),
          },
        });
        if (created.error) throw new Error(created.error.message);
        parentId = created.data.user?.id ?? null;
        parentAccountCreated = Boolean(parentId);

        if (parentId) {
          const { error: pErr } = await supabaseAdmin.from("profiles").upsert({
            id: parentId,
            first_name: data.parent.firstName.trim(),
            last_name: data.parent.lastName.trim(),
            email: parentEmail,
            phone: data.parent.phone.trim(),
            is_active: true,
          });
          if (pErr) throw new Error(pErr.message);
        }
      }

      if (parentId) {
        const { error: rErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: parentId, role: "parent" }, { onConflict: "user_id,role" });
        if (rErr) throw new Error(rErr.message);

        const { error: lErr } = await supabaseAdmin.from("parent_student").insert({
          parent_id: parentId,
          student_id: student.id,
          relationship: data.parent.relationship,
          is_primary: true,
        });
        if (lErr) throw new Error(lErr.message);
      }
    }

    return {
      id: student.id,
      admissionNo: student.admission_no,
      parentLinked: Boolean(parentId),
      parentAccountCreated,
    };
  });
