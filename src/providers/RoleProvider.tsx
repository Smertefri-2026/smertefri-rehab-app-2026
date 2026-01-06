"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
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

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? null);

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, email")
          .eq("id", user.id)
          .single();

        if (profile?.email) setEmail(profile.email);
        if (profile?.role) setRole(profile.role as Role);
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
  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }
  return context;
}