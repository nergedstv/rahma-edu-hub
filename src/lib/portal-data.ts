import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type StudentRow = {
  id: string;
  first_name: string;
  last_name: string;
  admission_no: string;
  current_class_id: string | null;
};

/** The student record linked to the signed-in student login. */
export function useMyStudent(userId?: string) {
  return useQuery({
    queryKey: ["my-student", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,first_name,last_name,admission_no,current_class_id")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as StudentRow | null) ?? null;
    },
  });
}

/** Children linked to the signed-in parent login. */
export function useMyChildren(userId?: string) {
  return useQuery({
    queryKey: ["my-children", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_student")
        .select("student_id,students(id,first_name,last_name,admission_no,current_class_id)")
        .eq("parent_id", userId!);
      if (error) throw error;
      return (data ?? [])
        .map((r) => r.students as StudentRow | null)
        .filter((s): s is StudentRow => Boolean(s));
    },
  });
}

export type MarkRow = {
  id: string;
  marks: number;
  grade: string | null;
  teacher_remarks: string | null;
  examName: string;
  examType: string;
  subject: string;
  maxMarks: number;
  examDate: string | null;
};

/** Published exam results for one student. */
export function useStudentMarks(studentId?: string) {
  return useQuery({
    queryKey: ["student-marks", studentId],
    enabled: Boolean(studentId),
    queryFn: async (): Promise<MarkRow[]> => {
      const { data, error } = await supabase
        .from("marks")
        .select(
          "id,marks,grade,teacher_remarks,exam_subjects(max_marks,exam_date,subjects(name),exams(name,type,published))",
        )
        .eq("student_id", studentId!);
      if (error) throw error;
      return (data ?? [])
        .map((m) => {
          const es = m.exam_subjects as unknown as {
            max_marks: number;
            exam_date: string | null;
            subjects: { name: string } | null;
            exams: { name: string; type: string; published: boolean } | null;
          } | null;
          if (!es?.exams?.published) return null;
          return {
            id: m.id,
            marks: Number(m.marks ?? 0),
            grade: m.grade,
            teacher_remarks: m.teacher_remarks,
            examName: es.exams.name,
            examType: es.exams.type,
            subject: es.subjects?.name ?? "Subject",
            maxMarks: Number(es.max_marks ?? 100),
            examDate: es.exam_date,
          } satisfies MarkRow;
        })
        .filter((m): m is MarkRow => Boolean(m));
    },
  });
}

/** Attendance rate + fee balance summary for one student. */
export function useStudentSummary(studentId?: string) {
  return useQuery({
    queryKey: ["student-summary", studentId],
    enabled: Boolean(studentId),
    queryFn: async () => {
      const [attendance, invoices, payments] = await Promise.all([
        supabase.from("attendance_records").select("status").eq("student_id", studentId!),
        supabase.from("invoices").select("amount,status").eq("student_id", studentId!),
        supabase.from("payments").select("amount").eq("student_id", studentId!),
      ]);
      const records = attendance.data ?? [];
      const present = records.filter((r) => r.status === "present" || r.status === "late").length;
      const billed = (invoices.data ?? []).reduce((s, i) => s + Number(i.amount ?? 0), 0);
      const paid = (payments.data ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0);
      return {
        attendanceRate: records.length ? Math.round((present / records.length) * 100) : null,
        billed,
        paid,
        balance: billed - paid,
      };
    },
  });
}

/** Upcoming school events (opening/closing days, meetings, etc.). */
export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: ["upcoming-events", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id,title,starts_at,venue,event_type")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Latest announcements. */
export function useAnnouncementFeed(limit = 4) {
  return useQuery({
    queryKey: ["announcement-feed", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,body,published_at")
        .order("published_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Timetable for a class. */
export function useClassTimetable(classId?: string | null) {
  return useQuery({
    queryKey: ["class-timetable", classId],
    enabled: Boolean(classId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select("id,day_of_week,starts_at,ends_at,room,subject_name,subjects(name)")
        .eq("class_id", classId!)
        .order("day_of_week")
        .order("starts_at");
      if (error) throw error;
      return (data ?? []).map((e) => ({
        id: e.id,
        day: e.day_of_week,
        starts_at: e.starts_at,
        ends_at: e.ends_at,
        room: e.room,
        subject: (e.subjects as { name: string } | null)?.name ?? e.subject_name ?? "Lesson",
      }));
    },
  });
}
