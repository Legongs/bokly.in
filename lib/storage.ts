import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImage(file: File, oldImageUrl?: string | null): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar maksimal 2MB ya.");
  }

  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  // 1. Delete old image if it exists
  if (oldImageUrl) {
    try {
      // Extract filename from URL
      // Example URL: https://<project>.supabase.co/storage/v1/object/public/maubookingin-media/123-abc.jpg
      const urlParts = oldImageUrl.split("/");
      const oldFileName = urlParts[urlParts.length - 1];
      if (oldFileName) {
        await supabase.storage.from("maubookingin-media").remove([oldFileName]);
      }
    } catch (e) {
      console.error("Gagal menghapus gambar lama", e);
    }
  }

  // 2. Upload new image
  const { data, error } = await supabase.storage
    .from("maubookingin-media")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error("Gagal mengunggah gambar. Coba lagi yuk.");
  }

  // 3. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("maubookingin-media")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
