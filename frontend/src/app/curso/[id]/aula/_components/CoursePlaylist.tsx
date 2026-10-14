"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface CoursePlaylistProps {
  course: any;
  currentLessonId: number;
  currentLessonCompleted?: boolean;
}

export default function CoursePlaylist({ course, currentLessonId, currentLessonCompleted }: CoursePlaylistProps) {
  const modules: any[] = course?.modules ?? [];

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

              return (
                <Link
                  key={l.id}
                  href={`/curso/${course.id}/aula/${l.id}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-orange-50 transition-all ${
                    isCurrent ? "bg-gray-50/80 border-l-4 border-[#2F52E0]" : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="w-6 flex items-center justify-center shrink-0">
                    {isDone(l) ? (
                      <CheckCircle className="h-4 w-4 text-green-500 fill-green-500/20" />
                    ) : (
                      <span className={`text-xs font-bold ${isCurrent ? "text-[#2F52E0]" : "text-gray-400"}`}>
                        {String(counter).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  <span className={`flex-1 leading-snug ${isCurrent ? "font-bold text-[#161B1D]" : "text-gray-600"}`}>
                    {l.title}
                  </span>

                  {minutes > 0 && (
                    <span className="text-[10px] font-bold text-gray-400 shrink-0">{minutes} min</span>
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