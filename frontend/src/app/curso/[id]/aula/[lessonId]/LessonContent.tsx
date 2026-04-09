import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Course, Lesson } from "@/data/courses";

interface LessonContentProps {
  course: Course;
  lesson: Lesson;
  lessonIndex: number;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  lessonsOpen: boolean;
  setLessonsOpen: (open: boolean) => void;
  prevLesson?: Lesson;
  nextLesson?: Lesson;
}

export default function LessonContent({
  course, lesson, lessonIndex, aiOpen, setAiOpen, lessonsOpen, setLessonsOpen, prevLesson, nextLesson
}: LessonContentProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <Link href={`/curso/${course.id}`} className="text-xs font-bold text-[#2F52E0] hover:underline flex items-center gap-1 mb-3 uppercase tracking-wider">
            <ArrowLeft className="h-3 w-3" /> {course.title}
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-[#161B1D]">{lessonIndex + 1}. {lesson.title}</h1>
          <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Duração estimada: {lesson.duration}
          </p>
        </div>

        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer shadow-lg ${
            aiOpen ? "bg-gray-100 text-gray-600" : "bg-[#2F52E0] text-white hover:opacity-90 cursor-pointer"
          }`}
        >
          <Sparkles className="h-5 w-5" /> Assistente IA
        </button>
      </div>

      <div className="flex items-center gap-3 mb-10 pb-10 border-b border-gray-100">
        {prevLesson && (
          <Link href={`/curso/${course.id}/aula/${prevLesson.id}`} className="flex-1">
            <button className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold cursor-pointer text-gray-600 hover:bg-gray-50 transition-all">← Anterior</button>
          </Link>
        )}
        {nextLesson && (
          <Link href={`/curso/${course.id}/aula/${nextLesson.id}`} className="flex-1">
            <button className="w-full py-3 px-4 rounded-xl bg-[#161B1D] text-white text-sm font-semibold cursor-pointer hover:bg-black shadow-md">Próxima →</button>
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <button onClick={() => setLessonsOpen(!lessonsOpen)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <ChevronDown className={`h-4 w-4 transition-transform ${lessonsOpen ? "rotate-180" : ""}`} />
            </div>
            <span className="font-bold text-[#161B1D]">Playlist do Curso</span>
          </div>
        </button>
        {lessonsOpen && (
          <div className="divide-y divide-gray-50">
            {course.lessons.map((l, i) => (
              <Link key={l.id} href={`/curso/${course.id}/aula/${l.id}`}
                className={`flex items-center gap-4 px-6 py-4 text-sm hover:bg-blue-50/50 transition-all ${l.id === lesson.id ? "bg-blue-50/80 border-l-4 border-[#2F52E0]" : ""}`}>
                <span className={`text-xs font-bold w-6 ${l.id === lesson.id ? "text-[#2F52E0]" : "text-gray-300"}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className={`flex-1 ${l.id === lesson.id ? "font-bold text-[#161B1D]" : "text-gray-600"}`}>{l.title}</span>
                <span className="text-[10px] font-bold text-gray-400">{l.duration}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}