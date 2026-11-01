import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  supabaseServiceKey,
  supabaseUrl,
  supabaseAnonKey,
} from "./env";

export function createAdminClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const key = supabaseServiceKey() || supabaseAnonKey();
  return createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
