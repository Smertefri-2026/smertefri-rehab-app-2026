"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

export type Role = "client" | "trainer" | "admin";

type RoleContextType = {
  userId: string | null;
  email: string | null;
  role: Role | null;
  loading: boolean;
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          setLoading(false);
          return;
        }

        const user = data.user;

        setUserId(user.id);
        setEmail(user.email ?? null);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, email")
          .eq("id", user.id)
          .single();

        if (!profileError && profile) {
          setRole(profile.role as Role);
          if (profile.email) setEmail(profile.email);
        }
      } catch (err) {
        console.error("RoleProvider error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <RoleContext.Provider
      value={{ userId, email, role, loading }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);

  // 🔐 I stedet for hard crash → trygg fallback
  if (!context) {
    return {
      userId: null,
      email: null,
      role: null,
      loading: true,
    };
  }

  return context;
}