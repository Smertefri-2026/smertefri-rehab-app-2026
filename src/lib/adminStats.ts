// src/lib/adminStats.ts
//
// Shared row-count helper for admin dashboards. Extracted from duplicated
// copies in Section7AdminStats.tsx and admin/activity/page.tsx.
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database.types";

type TableName = keyof Database["public"]["Tables"];

export async function countRows<T extends TableName>(
  table: T,
  apply?: (q: any) => any
): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}
