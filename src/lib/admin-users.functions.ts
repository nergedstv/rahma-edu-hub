import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "headteacher", "teacher", "parent", "student"]),
  /** For role=student: the student record this login belongs to. */
  studentId: z.string().uuid().optional().nullable(),
  /** For role=parent: children linked to this parent. */
  childIds: z.array(z.string().uuid()).optional(),
});

export const createPortalUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [{ data: isAdmin }, { data: isHead }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "headteacher" }),
    ]);
    if (!isAdmin && !isHead) throw new Error("Forbidden: only administrators can create accounts.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone ?? null,
      },
    });
    if (created.error) throw new Error(created.error.message);
    const newId = created.data.user?.id;
    if (!newId) throw new Error("Account creation failed.");

    const { error: pErr } = await supabaseAdmin.from("profiles").upsert({
      id: newId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      is_active: true,
    });
    if (pErr) throw new Error(pErr.message);

    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: newId, role: data.role }, { onConflict: "user_id,role" });
    if (rErr) throw new Error(rErr.message);

    if (data.role === "student" && data.studentId) {
      const { error } = await supabaseAdmin
        .from("students")
        .update({ user_id: newId })
        .eq("id", data.studentId);
      if (error) throw new Error(error.message);
    }

    if (data.role === "parent" && data.childIds?.length) {
      const rows = data.childIds.map((student_id, i) => ({
        parent_id: newId,
        student_id,
        relationship: "parent",
        is_primary: i === 0,
      }));
      const { error } = await supabaseAdmin.from("parent_student").insert(rows);
      if (error) throw new Error(error.message);
    }

    return { id: newId };
  });
