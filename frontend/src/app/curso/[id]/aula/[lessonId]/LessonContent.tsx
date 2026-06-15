"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, CheckCircle } from "lucide-react";
import { completeLesson } from "@/services/courses"; 

interface LessonContentProps {
  course: any;
  lesson: any;
  lessonIndex: number;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  lessonsOpen: boolean;
  setLessonsOpen: (open: boolean) => void;
  prevLesson?: any;
  nextLesson?: any;
}

export default function LessonContent({
  course,
  lesson,
  lessonIndex,
  aiOpen,
  setAiOpen,
  lessonsOpen,
  setLessonsOpen,
  prevLesson,
  nextLesson,
}: LessonContentProps) {
  const [isCompleted, setIsCompleted] = useState(lesson?.completed || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeLesson(lesson.id);
      setIsCompleted(true);
      
      lesson.completed = true;
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao salvar o progresso da aula.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 bg-white rounded-2xl border border-gray-100 shadow-sm">

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <Link
            href={`/curso/${course.id}`} 
            className="text-xs font-bold text-[#2F52E0] hover:underline flex items-center gap-1 mb-3 uppercase tracking-wider" 
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar ao curso
          </Link>

          <h1 className="text-2xl md:text-3xl font-black text-[#161B1D]">
            {lessonIndex + 1}. {lesson.title}
          </h1>

          <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Duração: {Math.floor(lesson.duration_seconds / 60)} min
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleComplete}
            disabled={isSubmitting || isCompleted}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer active:scale-95 disabled:pointer-events-none ${
              isCompleted
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <CheckCircle className={`h-4 w-4 ${isCompleted ? "fill-green-600 text-white" : ""}`} />
            {isCompleted ? "Concluída" : isSubmitting ? "Salvando..." : "Concluir Aula"}
          </button>

          <button 
            onClick={() => setAiOpen(!aiOpen)} 
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer active:scale-95 ${
              aiOpen
                ? "bg-gray-100 text-gray-600"
                : "bg-[#2F52E0] text-white hover:opacity-90"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Assistente IA
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-10 pb-10 border-b border-gray-100">
        {prevLesson && (
          <Link href={`/curso/${course.id}/aula/${prevLesson.id}`} className="flex-1">
            <button className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
              ← Anterior
            </button>
          </Link>
        )}

        {nextLesson && (
          <Link href={`/curso/${course.id}/aula/${nextLesson.id}`} className="flex-1">
            <button className="w-full py-3 px-4 rounded-xl bg-[#161B1D] text-white text-sm font-semibold hover:bg-black shadow-md cursor-pointer">
              Próxima →
            </button>
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <button 
          onClick={() => setLessonsOpen(!lessonsOpen)} 
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                lessonsOpen ? "rotate-180" : ""
              }`}
            />
            <span className="font-bold text-[#161B1D]">
              Playlist do Curso
            </span>
          </div>
        </button>

        {lessonsOpen && (
          <div className="divide-y divide-gray-50">
            {course.modules?.map((module: any) => (
              <div key={module.id}>
                <p className="px-6 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">
                  {module.title}
                </p>

                {module.lessons.map((l: any, i: number) => {
                  const isLessonDone = l.id === lesson.id ? isCompleted : l.completed;

                  return (
                    <Link
                      key={l.id}
                      href={`/curso/${course.id}/aula/${l.id}`}
                      className={`flex items-center gap-4 px-6 py-4 text-sm hover:bg-blue-50/50 transition-all ${
                        l.id === lesson.id
                          ? "bg-blue-50/80 border-l-4 border-[#2F52E0]"
                          : ""
                      }`}
                    >
                      <div className="w-6 flex items-center justify-center shrink-0">
                        {isLessonDone ? (
                          <CheckCircle className="h-4 w-4 text-green-500 fill-green-500/20" />
                        ) : (
                          <span className={`text-xs font-bold ${
                            l.id === lesson.id ? "text-[#2F52E0]" : "text-gray-300"
                          }`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        )}
                      </div>

                      <span className={`flex-1 ${
                        l.id === lesson.id
                          ? "font-bold text-[#161B1D]"
                          : "text-gray-600"
                      }`}>
                        {l.title}
                      </span>

                      <span className="text-[10px] font-bold text-gray-400">
                        {Math.floor(l.duration_seconds / 60)} min
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}