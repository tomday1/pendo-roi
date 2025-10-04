// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!url) throw new Error("REACT_APP_SUPABASE_URL is missing");
if (!key) throw new Error("REACT_APP_SUPABASE_ANON_KEY is missing");
if (!url || !key) {
  // Show a visible error in prod builds
  console.error("Missing Supabase env vars. Check Vercel project settings.");
}
export const supabase = createClient(url || "https://invalid.local", key || "invalid");