import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

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
      handleNavigateToLesson(lessons[0].id);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28 shadow-sm">
        
        <h2 className="font-bold text-[#161B1D] mb-6 flex items-center justify-between">
          Conteúdo do curso
          <span className="text-xs font-normal text-gray-400">
            {lessons.length} aulas
          </span>
        </h2>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {course.modules?.map((module: any) => (
            <div key={module.id} className="mb-4">

              <p className="text-xs font-bold text-gray-400 mb-2 mt-3">
                {module.title}
              </p>

              {module.lessons?.map((lesson: any, i: number) => (
                <div
                  key={lesson.id}
                  onClick={() => handleNavigateToLesson(lesson.id)}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-300 group-hover:text-[#2F52E0]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-[#161B1D]">
                      {lesson.title}
                    </p>

                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Play size={10} />
                      {Math.floor(lesson.duration_seconds / 60)} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button 
          onClick={handleStartOrCreateProgress}
          className="w-full mt-8 py-4 bg-[#2F52E0] text-white rounded-xl font-bold shadow-lg cursor-pointer hover:opacity-90 transition-all active:scale-[0.98] text-center"
        >
          {course?.progress > 0 ? "Continuar curso" : "Continuar"}
        </button>
      </div>
    </div>
  );
}