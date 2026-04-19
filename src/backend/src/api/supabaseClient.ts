import { createClient } from "@supabase/supabase-js";

const supabaseURL = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseURL || !supabaseAnonKey || !supabaseServiceKey) {
  console.log("check .env file");
  throw new Error("undefined url or keys");
}

export const supabaseAnon = createClient(supabaseURL, supabaseAnonKey);
export const supabaseService = createClient(supabaseURL, supabaseServiceKey);
