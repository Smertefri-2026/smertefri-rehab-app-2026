import { createClient } from "@supabase/supabase-js";

/**
 * Server-side auth check for API routes.
 *
 * This app has no service-role Supabase client (by design — see revisjonen).
 * A fresh anon-key client's `auth.getUser(jwt)` is enough to validate a
 * bearer token against Supabase Auth without needing elevated privileges:
 * it simply asks Supabase "is this a real, current access token, and whose
 * is it" — the same check RLS itself relies on.
 *
 * Callers must send `Authorization: Bearer <access_token>`, where the
 * token comes from `supabase.auth.getSession()` on the client.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type AuthedUser = {
  id: string;
  email: string | null;
  role: "client" | "trainer" | "admin" | null;
};

/**
 * Resolves the caller's identity from the `Authorization: Bearer <token>`
 * header. Returns `null` if the header is missing or the token is invalid
 * or expired — callers should respond 401 in that case.
 */
export async function getAuthedUser(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  // RLS-scoped klient: profiles-oppslaget må kjøre SOM brukeren (auth.uid()
  // må være satt), ellers treffer ingen select-policy og role blir alltid
  // null — uansett faktisk rolle.
  const scoped = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: profile } = await scoped
    .from("profiles")
    .select("role, email")
    .eq("id", data.user.id)
    .single();

  return {
    id: data.user.id,
    email: profile?.email ?? data.user.email ?? null,
    role: (profile?.role as AuthedUser["role"]) ?? null,
  };
}

/**
 * Convenience guard for routes that require a specific role (e.g. admin).
 * Pass `null` for `requiredRole` to just require *any* authenticated user.
 */
export async function requireAuth(
  req: Request,
  requiredRole?: AuthedUser["role"]
): Promise<{ user: AuthedUser } | { error: string; status: number }> {
  const user = await getAuthedUser(req);
  if (!user) return { error: "Ikke innlogget", status: 401 };
  if (requiredRole && user.role !== requiredRole) {
    return { error: "Ingen tilgang", status: 403 };
  }
  return { user };
}
