/** Static school details carried over from the existing Rahma site. */
export const school = {
  name: "Rahma Junior Education Center",
  shortName: "Rahma Junior",
  motto: "Foundation for Knowledge",
  values: "Dedication, Efficiency, Integrity and Team Work.",
  phone: "+254 700 000 000",
  email: "info@rahmajunioreducation.ac.ke",
  location: "Rahma Junior Education Center",
} as const;

export const APP_ROLES = ["admin", "headteacher", "teacher", "parent", "student"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrator",
  headteacher: "Head Teacher",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
};

export const dayNames = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function fullName(p?: { first_name?: string | null; last_name?: string | null } | null) {
  if (!p) return "";
  return [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
}

export function money(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `KSh ${n.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function gradeFor(marks: number, max = 100) {
  const pct = max ? (marks / max) * 100 : 0;
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "E";
}
