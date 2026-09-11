import { supabase } from "@/lib/supabaseClient";

export type TestCategory = "bodyweight" | "strength" | "cardio";
export const TEST_CATEGORIES: TestCategory[] = ["bodyweight", "strength", "cardio"];

export type TestCategoryAccess = Record<TestCategory, { enabled: boolean; hasHistory: boolean }>;

/**
 * Hvilke testkategorier en kunde faktisk kan se. En kategori er synlig
 * hvis treneren har aktivert den ELLER kunden allerede har historikk der
 * (grandfather — aktivering skal aldri skjule data som allerede finnes).
 */
export async function getTestCategoryAccess(clientId: string): Promise<TestCategoryAccess> {
  const [{ data: enabledRows, error: enabledErr }, { data: sessionRows, error: sessionErr }] =
    await Promise.all([
      supabase.from("client_test_categories").select("category").eq("client_id", clientId),
      supabase.from("test_sessions").select("category").eq("client_id", clientId),
    ]);

  if (enabledErr) throw enabledErr;
  if (sessionErr) throw sessionErr;

  const enabledSet = new Set((enabledRows ?? []).map((r) => r.category as TestCategory));
  const historySet = new Set((sessionRows ?? []).map((r) => r.category as TestCategory));

  const access = {} as TestCategoryAccess;
  for (const category of TEST_CATEGORIES) {
    access[category] = {
      enabled: enabledSet.has(category),
      hasHistory: historySet.has(category),
    };
  }
  return access;
}

/** Rehabtrener/admin: slå en testkategori av/på for én kunde. */
export async function setTestCategoryEnabled(
  clientId: string,
  category: TestCategory,
  enabled: boolean
): Promise<void> {
  if (enabled) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("client_test_categories")
      .upsert({ client_id: clientId, category, enabled_by: user?.id ?? null }, { onConflict: "client_id,category" });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("client_test_categories")
      .delete()
      .eq("client_id", clientId)
      .eq("category", category);
    if (error) throw error;
  }
}
