// src/utils/presetsRemote.js
import { supabase } from "./supabaseClient";

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

async function isAdmin(userId) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  if (error) return false;
  return !!data?.is_admin;
}

export async function listCustomers() {
  const user = await getUser();
  if (!user) return []; // guest -> no server list, use local mode
  // RLS will return all customers for admins, and only permitted ones for members
  const { data, error } = await supabase
    .from("customers")
    .select("id,name")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function loadCustomerPreset(customerId) {
  const user = await getUser();
  if (!user) throw new Error("Sign in required to load customer presets.");
  const { data, error } = await supabase
    .from("customer_presets")
    .select("data")
    .eq("customer_id", customerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

export async function saveCustomerPreset(customerId, state) {
  const user = await getUser();
  if (!user) throw new Error("Sign in required to save customer presets.");
  const { error } = await supabase.from("customer_presets").insert({
    customer_id: customerId,
    data: state,
    created_by: user.id,
  });
  if (error) throw error;
}

export async function canEditCustomer(customerId) {
  const user = await getUser();
  if (!user) return false;

  // Admins can edit any customer, regardless of membership
  if (await isAdmin(user.id)) return true;

  // Otherwise must be editor/owner on that customer
  const { data, error } = await supabase
    .from("customer_access")
    .select("role")
    .eq("customer_id", customerId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return false;
  return data?.role === "editor" || data?.role === "owner";
}

export async function getUserEmail() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.email ?? null;
}