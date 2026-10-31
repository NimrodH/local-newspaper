import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** Browser-safe client (anon key, respects Row Level Security). */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Server-only: creates a Supabase client with the service role key.
 * Bypasses Row Level Security — call only inside route loaders/actions.
 */
export function createAdminClient() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type Issue = Tables<"issues">;
export type Article = Tables<"articles">;
export type ButtonClick = Tables<"button_clicks">;
