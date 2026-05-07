import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function setSupabaseClient(url: string, anonKey: string) {
  _client = createClient(url, anonKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  return _client;
}
