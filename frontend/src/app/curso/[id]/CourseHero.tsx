"use client";

import Link from "next/link"; 
import { formatName } from "@/utils/formatName";
import { User, BookOpen, Play, Heart, Award, CheckCircle2, Sparkles, GraduationCap, ArrowRight } from "lucide-react";

interface CourseHeroProps {
  course: any;
  isFavorited: boolean;
  onFavoriteToggle: () => void;
  onPlayClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function CourseHero({ course, isFavorited, onFavoriteToggle, onPlayClick }: CourseHeroProps) {
  const lessons = course.modules?.flatMap((m: any) => m.lessons) || [];

  const professorSlug = course.professor_slug || course.professor?.slug || (course.professor_name
    ? course.professor_name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "_")
    : "");

  const objetivos = course.learning_objectives || [
    "Domínio completo dos Conceitos Fundamentais e Arquitetura",
    "Aplicação prática de padrões recomendados pelo Mercado",
    "Desenvolvimento guiado de Projetos Reais e Escaláveis",
    "Mentoria e Inteligência Artificial orientada à prática"
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-x text-[11px] font-bold bg-gray-100 text-[black] border border-gray-100">
             Vídeo de Apresentação
          </span>
          <span className="text-xs text-zinc-400 font-medium">Visão geral do curso</span>
        </div>

        <div 
          onClick={(e) => onPlayClick?.(e)} 
          className="aspect-video rounded-3xl bg-zinc-900 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-xl border border-zinc-100/80 transition-all hover:shadow-2xl"
        >
          {course?.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl scale-100 group-hover:scale-110 transition-all duration-300 z-10 relative flex items-center gap-3 border border-white/20">
            <div className="w-12 h-12 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Play className="h-6 w-6 fill-white ml-0.5" />
            </div>
            <div className="pr-2 text-left hidden sm:block">
              <p className="text-xs font-bold text-zinc-900">Assistir Aula Inicial</p>
              <p className="text-[10px] text-zinc-500 font-medium">Começar introdução</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            {course.title}
          </h1>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 cursor-pointer shadow-sm select-none shrink-0 ${
            isFavorited
              ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100/70 shadow-red-100"
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
          }`} 
        >
          <Heart className={`h-4 w-4 transition-transform ${isFavorited ? "fill-red-600 text-red-600 scale-110" : ""}`} />
          <span className="hidden sm:inline">
            {isFavorited ? "Favoritado" : "Favoritar"}
          </span>
        </button>
      </div>

      <p className="text-sm text-zinc-600 font-normal leading-relaxed bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
        {course.description}
      </p>

      <Link 
        href={`/professor/${professorSlug}`}
        className="flex items-center justify-between p-5 rounded-2xl bg-white border border-zinc-100 hover:border-orange-200 hover:shadow-md transition-all group cursor-pointer block"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center border border-orange-100/80 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
            <User size={22} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Instrutor da Disciplina</p>
            <h3 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors mt-0.5">
              {course.professor_name ? formatName(course.professor_name) : "Professor Titular"}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 group-hover:text-[#FF7A00] transition-colors pr-2">
          <span>Ver perfil completo</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-orange-50 text-[#FF7A00]">
              <GraduationCap size={16} />
            </div>
            Objetivos de Aprendizado
          </h2>
          <span className="text-[11px] font-semibold text-zinc-400">Metas do Curso</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          {objetivos.map((item: string, idx: number) => (
            <div 
              key={idx} 
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-orange-50/40 hover:border-orange-200/60 transition-all duration-200 group cursor-default shadow-2xs"
            >
              <div className="h-6 w-6 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={14} className="stroke-[3]" />
              </div>
              <span className="text-xs font-semibold text-zinc-700 leading-snug group-hover:text-zinc-900">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}