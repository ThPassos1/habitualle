import "server-only";

import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function supabaseSetupMessage(audience: "loja" | "admin") {
  if (audience === "admin") {
    return "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY, e rode supabase/migrations/20260930120000_store_orders.sql no SQL Editor.";
  }

  if (process.env.NODE_ENV === "development") {
    return "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY, e rode a migração SQL.";
  }

  return "Não foi possível registrar o pedido agora. Tente de novo em instantes.";
}
