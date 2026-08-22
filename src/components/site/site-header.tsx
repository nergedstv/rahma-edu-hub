import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { logoUrl } from "@/lib/assets";
import { useI18n } from "@/lib/i18n";
import { school } from "@/lib/school";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", key: "home" },
  { to: "/about", key: "about" },
  { to: "/academics", key: "academics" },
  { to: "/admissions", key: "admissions" },
  { to: "/gallery", key: "gallery" },
  { to: "/contact", key: "contact" },
] as const;

export function SiteHeader() {
  const { t, lang, toggle } = useI18n();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt={`${school.name} logo`}
            className="size-11 rounded-full object-cover ring-2 ring-accent"
          />
          <span className="leading-tight">
            <span className="block font-display text-sm font-extrabold text-navy sm:text-base">
              {school.shortName}
            </span>
            <span className="block text-[11px] uppercase tracking-brand text-muted-foreground">
              {school.motto}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-navy"
              activeProps={{ className: "bg-secondary !text-navy" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="font-semibold uppercase"
            aria-label="Switch language"
          >
            {lang === "en" ? "SO" : "EN"}
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={session ? "/dashboard" : "/auth"}>
              {session ? t("portal") : t("login")}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium text-foreground",
                      "hover:bg-secondary",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <Button asChild className="mt-4">
                  <Link to={session ? "/dashboard" : "/auth"} onClick={() => setOpen(false)}>
                    {session ? t("portal") : t("login")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
