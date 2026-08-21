import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/school";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries({ queryKey: ["me"] });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  is_active: boolean;
};

/** Current profile + roles. The single source of truth for portal permissions. */
export function useMe() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ["me", userId],
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async () => {
      const [{ data: profile, error: pErr }, { data: roleRows, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      const roles = (roleRows ?? []).map((r) => r.role as AppRole);
      return { profile: (profile as Profile | null) ?? null, roles };
    },
  });

  const roles = query.data?.roles ?? [];
  const primaryRole: AppRole =
    (["admin", "headteacher", "teacher", "parent", "student"] as AppRole[]).find((r) =>
      roles.includes(r),
    ) ?? "parent";

  return {
    userId,
    user,
    profile: query.data?.profile ?? null,
    roles,
    primaryRole,
    hasRole: (r: AppRole) => roles.includes(r),
    isStaff: roles.some((r) => r === "admin" || r === "headteacher" || r === "teacher"),
    isAdmin: roles.some((r) => r === "admin" || r === "headteacher"),
    loading: loading || query.isLoading,
    refetch: query.refetch,
  };
}
