import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-only: creates a Supabase client with the service role key.
 * Bypasses Row Level Security — call only inside route loaders/actions.
 */
export function createAdminClient() {
  const url = process.env.VITE_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(url, key);
}

export type Issue = {
  id: number;
  issue_number: number;
  order_number: number;
  issue_date: string;
  approved_for_display: boolean;
};

export type Article = {
  id: number;
  title: string;
  content: string;
  issue_number: number;
  order_in_issue: number;
  keywords: string;
  related_images: string[];
};
