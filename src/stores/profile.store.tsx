// src/stores/profile.store.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/profile";
import { useRole } from "@/providers/RoleProvider";

export type MyProfile = {
  id?: string;
  email?: string | null;

  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  avatar_url?: string | null;

  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
};

type ProfileContextType = {
  profile: MyProfile | null;
  loading: boolean;
  error: string | null;

  refreshProfile: () => Promise<void>;
  patchProfileLocal: (patch: Partial<MyProfile>) => void;
  saveProfile: (patch: Partial<MyProfile>) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { role } = useRole(); // vi venter til rolle finnes (som du gjør i stores)
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProfile();

      setProfile({
        id: data.id,
        email: data.email ?? null,

        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        phone: data.phone ?? null,
        birth_date: data.birth_date ?? null,
        avatar_url: data.avatar_url ?? null,

        address: data.address ?? null,
        postal_code: data.postal_code ?? null,
        city: data.city ?? null,
      });
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke laste profil.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role) load();
  }, [role]);

  function patchProfileLocal(patch: Partial<MyProfile>) {
    setProfile((prev) => (prev ? { ...prev, ...patch } : { ...patch }));
  }

  async function saveProfile(patch: Partial<MyProfile>) {
    // Optimistisk UI
    const prev = profile;
    patchProfileLocal(patch);

    try {
      await updateMyProfile(patch);
    } catch (e) {
      // rollback hvis ønskelig
      if (prev) setProfile(prev);
      throw e;
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refreshProfile: load,
        patchProfileLocal,
        saveProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useMyProfileStore() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useMyProfileStore må brukes innenfor ProfileProvider");
  return ctx;
}