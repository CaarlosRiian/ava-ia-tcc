import { supabase } from "./supabaseClient";

interface UploadOptions {
  bucket: "course-thumbnails" | "course-lessons";
  file: File;
  folder?: string;
}

export async function uploadMedia({ bucket, file, folder = "" }: UploadOptions) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    if (bucket === "course-thumbnails") {
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        publicUrl: publicUrlData.publicUrl,
      };
    }

    return {
      path: data.path,
      publicUrl: null,
    };
  } catch (error) {
    console.error("Erro ao fazer upload no Supabase Storage:", error);
    throw error;
  }
}