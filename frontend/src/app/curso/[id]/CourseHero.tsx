"use client";

import Link from "next/link"; 
import { formatName } from "@/utils/formatName";
import { Clock, User, BookOpen, Play, Heart, Award, CheckCircle2 } from "lucide-react";

interface CourseHeroProps {
  course: any;
  isFavorited: boolean;
  onFavoriteToggle: () => void;
  onPlayClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function CourseHero({course, isFavorited, onFavoriteToggle, onPlayClick
}: CourseHeroProps) {
  const lessons = course.modules?.flatMap((m: any) => m.lessons) || [];

  const totalSeconds = lessons.reduce(
    (acc: number, lesson: any) => acc + lesson.duration_seconds,
    0
  );

  const professorSlug = course.professor_name
    ? course.professor_name.toLowerCase().trim().replaceAll(" ", "_")
    : "";

  return (
    <>
      <div 
        onClick={(e) => onPlayClick?.(e)} 
        className="aspect-video rounded-2xl bg-gray-900 mb-6 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-md border border-gray-100"
      >
        {course?.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

        <div className="bg-white rounded-full p-5 shadow-2xl scale-100 group-hover:scale-110 transition-transform z-10 relative bg-white/90 backdrop-blur-sm">
          <Play className="h-7 w-7 text-[#2F52E0] fill-[#2F52E0] ml-0.5" />
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#161B1D]">
          {course.title}
        </h1>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer shadow-sm select-none shrink-0 ${
            isFavorited
              ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100/70"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
          }`} 
        >
          <Heart className={`h-3.5 w-3.5 transition-transform ${isFavorited ? "fill-red-600 text-red-600 scale-105" : ""}`} />
          <span className="hidden sm:inline">
            {isFavorited ? "Favoritado" : "Favoritar"}
          </span>
        </button>
      </div>

      <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">
        {course.description}
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        
        <Link 
          href={`/professor/${professorSlug}`}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 group/instructor cursor-pointer block"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-50 text-[#FF7A00] flex items-center justify-center border border-blue-100/50 group-hover/instructo transition-all">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Instrutor da Disciplina</p>
              <h3 className="text-sm font-semibold text-gray-800 group-hover/instructor:font-bold transition-colors">
                {course.professor_name ? formatName(course.professor_name) : "Professor Da Silva"}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-[11px] text-gray-500 font-medium w-fit group-hover/instructor:bg-gray-100 transition-colors">
            <Award size={14} className="text-amber-500" />
            <span>Conteúdo Acadêmico Verificado</span>
          </div>
        </Link>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-2">
            <BookOpen size={15} className="text-[#00000]" />
            Objetivos de Aprendizado
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Conceitos Fundamentais e Teoria",
              "Práticas Alinhadas ao Mercado",
              "Desenvolvimento de Projetos Reais",
              "Apoio e Consultoria com a Comunidade"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition duration-200">
                <div className="h-5 w-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={13} className="stroke-[2.5]" />
                </div>
                <span className="text-xs font-medium text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}