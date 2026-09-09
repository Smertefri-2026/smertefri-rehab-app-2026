import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// NB: not yet wired to the generated `Database` type (src/types/database.types.ts).
// The old marketplace-era API files (trainer_client_links, set_my_trainer,
// chat_search_users, etc.) still reference tables/RPCs that don't exist in
// the new schema — wiring the generic now would fail typecheck across those
// files. They're scheduled for replacement in Fase 1 (nøytraliser
// markedsplassen); wire this generic back in as part of that work.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);