import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Users,
  UserRound,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { logoUrl } from "@/lib/assets";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { fullName, initials, roleLabels, school } from "@/lib/school";

type Item = {
  to: string;
  key: TranslationKey;
  icon: typeof LayoutDashboard;
  show: (p: { isStaff: boolean; isAdmin: boolean; isParent: boolean }) => boolean;
};

const items: Item[] = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard, show: () => true },
  { to: "/portal/students", key: "students", icon: GraduationCap, show: (p) => p.isStaff },
  { to: "/portal/classes", key: "classes", icon: BookOpen, show: (p) => p.isStaff },
  { to: "/portal/people", key: "people", icon: Users, show: (p) => p.isAdmin },
  { to: "/portal/attendance", key: "attendance", icon: ClipboardCheck, show: (p) => p.isStaff },
  { to: "/portal/results", key: "results", icon: Award, show: (p) => p.isParent || p.isStudent },
  { to: "/portal/timetable", key: "timetable", icon: CalendarDays, show: () => true },
  { to: "/portal/finance", key: "finance", icon: Wallet, show: () => true },
  { to: "/portal/announcements", key: "announcements", icon: Megaphone, show: () => true },
  { to: "/portal/messages", key: "messages", icon: MessageSquare, show: () => true },
  { to: "/portal/profile", key: "profile", icon: UserRound, show: () => true },
];

export function PortalShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { profile, primaryRole, isStaff, isAdmin, hasRole } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const perms = { isStaff, isAdmin, isParent: hasRole("parent") };
  const visible = items.filter((i) => i.show(perms));
  const name = fullName(profile) || "Portal user";

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {visible.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-navy-foreground/75 transition-colors hover:bg-white/10 hover:text-navy-foreground"
          activeProps={{ className: "bg-white/15 !text-navy-foreground" }}
        >
          <item.icon className="size-4" />
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-secondary/40 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden bg-navy p-4 text-navy-foreground lg:block">
        <Link to="/" className="flex items-center gap-3 px-1 py-2">
          <img
            src={logoUrl}
            alt={`${school.name} logo`}
            className="size-10 rounded-full object-cover ring-2 ring-accent"
          />
          <span className="font-display text-sm font-extrabold">{school.shortName}</span>
        </Link>
        <div className="my-4 h-px bg-white/15" />
        {nav}
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-navy text-navy-foreground">
              <div className="mt-8">{nav}</div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy">{name}</p>
              <p className="text-[11px] uppercase tracking-brand text-muted-foreground">
                {roleLabels[primaryRole]}
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initials(name)}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label={t("logout")}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
