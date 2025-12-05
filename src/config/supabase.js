import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function connectSupabase() {
  console.log("Connecting to supabase");
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connected successfully!");
    console.log("Buckets:", data);
  }
}
