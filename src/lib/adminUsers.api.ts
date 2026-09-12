// src/lib/adminUsers.api.ts
//
// Admin → Brukere: rolleadministrasjon. Administrativt unntaksverktøy —
// trenersøknad/godkjenning (trainerApplications.api.ts) er fortsatt
// normalveien til rollen 'trainer'.
import { supabase } from "@/lib/supabaseClient";

export type UserRole = "client" | "trainer" | "admin";

export async function adminSetUserRole(userId: string, newRole: UserRole): Promise<void> {
  const { error } = await supabase.rpc("admin_set_user_role", {
    p_user_id: userId,
    p_new_role: newRole,
  });
  if (error) throw new Error(error.message);
}
