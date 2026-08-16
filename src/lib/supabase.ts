import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ||
  "https://geleljrztkdxlsdsvmmy.supabase.co";

// Fallback to non-empty key structure so createClient never crashes on startup if env is missing
const supabasePublishableKey =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  "sb_publishable_Zq4YOMEEtFx8YKFlzxamQg_ot7cLM9E";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
