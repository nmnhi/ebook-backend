// src/services/uploadService.js
import { supabase } from "../config/supabase.js";

/**
 * Upload a file buffer to Supabase Storage
 * @param {string} bucket - Supabase bucket name
 * @param {string} filePath - Path inside bucket (e.g. "books/123.pdf")
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - MIME type (e.g. "application/pdf")
 */
export async function uploadToSupabase(bucket, filePath, buffer, contentType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error("❌ Upload failed:", error.message);
    throw new Error("Upload to Supabase failed");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}
