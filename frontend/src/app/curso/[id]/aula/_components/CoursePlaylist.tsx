"use client";

import Link from "next/link";
import { CheckCircle, PlayCircle, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface CoursePlaylistProps {
  course: any;
  currentLessonId: number;
  currentLessonCompleted?: boolean;
}

export default function CoursePlaylist({ course, currentLessonId, currentLessonCompleted }: CoursePlaylistProps) {
  const modules: any[] = course?.modules ?? [];

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

  const isDone = (l: any) =>
    Number(l.id) === Number(currentLessonId)
      ? currentLessonCompleted ?? !!(l.completed || l.is_completed)
      : !!(l.completed || l.is_completed);

  const allLessons = modules.flatMap((m) => m.lessons || []);
  const doneCount = allLessons.filter(isDone).length;
  let counter = 0;

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="px-5 py-3 border-b border-gray-100 shrink-0 bg-white">
        <p className="text-[11px] font-semibold text-gray-500">
          {doneCount} / {allLessons.length} aulas concluídas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-50">
        {modules.map((module) => (
          <div key={module.id}>
            <p className="px-5 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50/70">
              {module.title}
            </p>

            {(module.lessons || []).map((l: any) => {
              counter += 1;
              const isCurrent = Number(l.id) === Number(currentLessonId);
              const minutes = Math.round((l.duration_seconds || 0) / 60);
              const lessonThumbnail = getLessonThumbnailUrl(l.thumbnail);
              const concluida = isDone(l);

              return (
                <Link
                  key={l.id}
                  href={`/curso/${course.id}/aula/${l.id}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-orange-50/60 transition-all ${
                    isCurrent ? "bg-orange-50/80 border-l-4 border-[#FF7A00]" : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60 shadow-inner flex items-center justify-center">
                    {lessonThumbnail ? (
                      <img
                        src={lessonThumbnail}
                        alt={l.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
                        <PlayCircle size={16} className="text-zinc-400" />
                      </div>
                    )}

                    {concluida && (
                      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[1px] flex items-center justify-center">
                        <CheckCircle size={18} className="text-white drop-shadow" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate leading-snug transition-colors ${
                      isCurrent ? "text-[#161B1D]" : "text-gray-700"
                    }`}>
                      {counter}. {l.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {concluida ? "Concluída" : minutes > 0 ? `${minutes} min` : "Aula"}
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-white bg-[#FF7A00] px-2 py-0.5 rounded-md shrink-0 shadow-sm">
                      Transmitindo
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}