import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { logoUrl, portalPhotos } from "@/lib/assets";
import { useI18n } from "@/lib/i18n";
import { school } from "@/lib/school";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Portal sign in — Rahma Junior Education Center" },
      {
        name: "description",
        content:
          "Sign in to the Rahma Junior Education Center portal for staff, parents and pupils.",
      },
      { property: "og:title", content: "Portal sign in — Rahma Junior" },
      {
        property: "og:description",
        content: "Secure access to results, attendance, fees and school messages.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % portalPhotos.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { first_name: firstName, last_name: lastName, phone },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt={`${school.name} logo`}
              className="size-11 rounded-full object-cover ring-2 ring-accent"
            />
            <span className="font-display text-sm font-extrabold text-navy">
              {school.shortName}
            </span>
          </Link>

          <h1 className="mt-10 font-display text-2xl font-bold text-navy">{t("signInTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("signInIntro")}</p>

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "signin" | "signup")}
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first">{t("firstName")}</Label>
                    <Input
                      id="first"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last">{t("lastName")}</Label>
                    <Input
                      id="last"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signin" ? t("signIn") : t("signUp")}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-brand text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={onGoogle}>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              ← Back to the website
            </Link>
          </p>
        </div>
      </div>

      {/* Photo side */}
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        {portalPhotos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-1000",
              i === slide ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
        <div className="absolute bottom-0 p-12 text-navy-foreground">
          <p className="text-xs font-semibold uppercase tracking-brand text-accent">
            {school.motto}
          </p>
          <p className="mt-3 max-w-md font-display text-2xl font-bold">{school.values}</p>
        </div>
      </div>
    </div>
  );
}
