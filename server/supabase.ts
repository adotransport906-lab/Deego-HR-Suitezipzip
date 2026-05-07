import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const rawUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rawUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

// Auto-correct dashboard URL → API URL
// e.g. https://supabase.com/dashboard/project/PROJ_REF → https://PROJ_REF.supabase.co
function normalizeSupabaseUrl(url: string): string {
  // Fix dashboard URL: https://supabase.com/dashboard/project/REF → https://REF.supabase.co
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch) return `https://${dashboardMatch[1]}.supabase.co`;

  // Fix project URL with trailing path: https://REF.supabase.co/rest/v1/ → https://REF.supabase.co
  const projectMatch = url.match(/^(https:\/\/[a-z0-9]+\.supabase\.co)/i);
  if (projectMatch) return projectMatch[1];

  return url;
}

const supabaseUrl = normalizeSupabaseUrl(rawUrl);
console.log(`[supabase] Using URL: ${supabaseUrl}`);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
});
