// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!url) throw new Error("REACT_APP_SUPABASE_URL is missing");
if (!key) throw new Error("REACT_APP_SUPABASE_ANON_KEY is missing");
export const supabase = createClient(url, key);

