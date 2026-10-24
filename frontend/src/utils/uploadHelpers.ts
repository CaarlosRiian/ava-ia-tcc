import { supabase } from "@/lib/supabaseClient";

export async function uploadThumbnailToSupabase(file: File, courseId: string | number, lessonId?: string | number) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `thumb-${Date.now()}.${fileExt}`;
    
    const filePath = lessonId 
      ? `courses/${courseId}/lessons/${lessonId}/thumbnails/${fileName}`
      : `courses/${courseId}/thumbnails/${fileName}`;

    const { error } = await supabase.storage
      .from("course-lessons") 
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    return filePath; 
  } catch (err) {
    console.error("Erro ao fazer upload da thumbnail:", err);
    throw err;
  }
}