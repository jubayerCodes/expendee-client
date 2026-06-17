import { createClient } from "@/lib/supabase/client";

export function useStorage() {
  const supabase = createClient();

  async function uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
        cacheControl: "3600",
      });

    if (error) throw error;

    return data;
  }

  // Get public URL
  async function getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }

  // Delete file
  async function deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  }

  return { uploadFile, getPublicUrl, deleteFile };
}
