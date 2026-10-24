"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, PlayCircle, BookOpen, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SidebarProps {
  course: any;
}

export default function CourseLessonsSidebar({ course }: SidebarProps) {
  const router = useRouter();
  
  const lessons = course.modules?.flatMap((m: any) => m.lessons) || [];

  const getLessonThumbnailUrl = (thumb?: string | null) => {
    if (!thumb || typeof thumb !== "string" || thumb.trim() === "") return null;
    if (thumb.startsWith("http://") || thumb.startsWith("https://")) {
      return thumb;
    }
    const { data } = supabase.storage
      .from("course-thumbnails") 
      .getPublicUrl(thumb);
    return data.publicUrl;
  };

  const handleNavigateToLesson = (lessonId: number | string) => {
    if (!course.id || !lessonId) return;
    router.push(`/curso/${course.id}/aula/${lessonId}`);
  };

  const handleStartOrCreateProgress = () => {
    if (lessons.length > 0) {
      const nextLesson = lessons.find((l: any) => !l.completed && !l.concluido) || lessons[0];
      handleNavigateToLesson(nextLesson.id);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-3xl border border-zinc-100 p-6 sticky top-28 shadow-sm">
        
        <h2 className="font-extrabold text-zinc-900 mb-6 flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#FF7A00]" /> Conteúdo do curso
          </span>
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-xl">
            {lessons.length} aulas
          </span>
        </h2>

        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
          {course.modules?.map((module: any) => (
            <div key={module.id} className="mb-4">

              <p className="text-[11px] font-extrabold text-zinc-400 mb-2 mt-3 tracking-wider uppercase">
                {module.title}
              </p>

              {module.lessons?.map((lesson: any, i: number) => {
                const isConcluida = !!(lesson.completed || lesson.concluido);
                const finalThumbnail = getLessonThumbnailUrl(lesson.thumbnail);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleNavigateToLesson(lesson.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all group cursor-pointer mb-2 ${
                      isConcluida 
                        ? "bg-emerald-50/40 border-emerald-100/80 hover:bg-emerald-50/80" 
                        : "bg-white border-zinc-100 hover:border-orange-200 hover:bg-orange-50/30 shadow-2xs"
                    }`}
                  >
                    <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100 shadow-inner flex items-center justify-center">
                      {finalThumbnail ? (
                        <img
                          src={finalThumbnail}
                          alt={lesson.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
                          <PlayCircle size={18} className="text-zinc-400 group-hover:text-[#FF7A00] transition-colors" />
                        </div>
                      )}

                      {isConcluida && (
                        <div className="absolute inset-0 bg-emerald-900/30 backdrop-blur-[1px] flex items-center justify-center">
                          <CheckCircle2 size={18} className="text-white drop-shadow" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate transition-colors ${
                        isConcluida 
                          ? "text-zinc-400 line-through decoration-zinc-300" 
                          : "text-zinc-700 group-hover:text-zinc-900"
                      }`}>
                        {i + 1}. {lesson.title}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {isConcluida ? "Concluída" : "Clique para assistir"}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <button 
          onClick={handleStartOrCreateProgress}
          className="w-full mt-6 py-4 bg-[#FF7A00] hover:bg-[#ea7306] text-white rounded-2xl font-extrabold shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-[0.98] text-center text-sm flex items-center justify-center gap-2"
        >
          <PlayCircle size={18} />
          {course?.progress > 0 ? "Continuar de onde parei" : "Começar a assistir"}
        </button>
      </div>
    </div>
  );
}