"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, PlayCircle } from "lucide-react";

interface SidebarProps {
  course: any;
}

export default function CourseLessonsSidebar({ course }: SidebarProps) {
  const router = useRouter();
  
  const lessons = course.modules?.flatMap((m: any) => m.lessons) || [];

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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28 shadow-sm">
        
        <h2 className="font-bold text-[#161B1D] mb-6 flex items-center justify-between">
          Conteúdo do curso
          <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {lessons.length} aulas
          </span>
        </h2>

        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
          {course.modules?.map((module: any) => (
            <div key={module.id} className="mb-4">

              <p className="text-xs font-bold text-gray-400 mb-2 mt-3 tracking-wider uppercase">
                {module.title}
              </p>

              {module.lessons?.map((lesson: any, i: number) => {
                const isConcluida = !!(lesson.completed || lesson.concluido);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleNavigateToLesson(lesson.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group cursor-pointer mb-1.5 ${
                      isConcluida 
                        ? "bg-emerald-50/40 border-emerald-100/70 hover:bg-emerald-50/80" 
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      {isConcluida ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <span className="text-xs font-bold text-gray-300 group-hover:text-[#FF7A00] transition-colors">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate transition-colors ${
                        isConcluida 
                          ? "text-gray-500 line-through decoration-gray-300" 
                          : "text-gray-700 group-hover:text-[#161B1D]"
                      }`}>
                        {lesson.title}
                      </p>
                    </div>

                    <div className="text-xs font-medium shrink-0">
                      {isConcluida ? (
                        <span className="text-emerald-600 text-[11px] bg-emerald-100/50 px-2 py-0.5 rounded-full">
                          Concluída
                        </span>
                      ) : (
                        <span className="text-gray-400 group-hover:text-[#000000] group-hover:bg-[#FF7A00]/5 transition-all px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                          <PlayCircle size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          Assistir
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <button 
          onClick={handleStartOrCreateProgress}
          className="w-full mt-6 py-4 bg-[#FF7A00] hover:bg-[#eb7305] text-white rounded-xl font-bold shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-[0.98] text-center text-sm"
        >
          {course?.progress > 0 ? "Continuar de onde parei" : "Começar a assistir"}
        </button>
      </div>
    </div>
  );
}