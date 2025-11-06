// src/lib/ensureUserRow.js
import { supabase } from "../lib/supabaseClient";

export async function ensureUserRow(authUser) {
  const { id, email, user_metadata } = authUser;

  const { error } = await supabase
    .from("users")
    .upsert(
      {
        id,                 // MUST match auth.uid()
        email,
        full_name: user_metadata?.full_name ?? null,
        first_name: user_metadata?.first_name ?? null,
        last_name: user_metadata?.last_name ?? null,
        grad_year: user_metadata?.grad_year ?? null,
      },
      { onConflict: "id" }
    );

  return { error };
}
