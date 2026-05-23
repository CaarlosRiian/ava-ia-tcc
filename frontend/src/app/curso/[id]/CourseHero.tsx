"use client";

import Link from "next/link"; 
import { formatName } from "@/utils/formatName";
import { Clock, User, BookOpen, CheckCircle2, Play, Heart } from "lucide-react";

interface CourseHeroProps {
  course: any;
  isFavorited: boolean;
  onFavoriteToggle: () => void;
  onPlayClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function CourseHero({
  course,
  isFavorited,
  onFavoriteToggle,
  onPlayClick
}: CourseHeroProps) {
  const lessons = course.modules?.flatMap((m: any) => m.lessons) || [];

  const totalSeconds = lessons.reduce(
    (acc: number, lesson: any) => acc + lesson.duration_seconds,
    0
  );

  const professorSlug = course.professor_name
    ? course.professor_name.toLowerCase().trim().replaceAll(" ", "_")
    : "";

  const totalHours = (totalSeconds / 3600).toFixed(1);

  return (
    <div className="lg:col-span-2">
      <div onClick={(e) => onPlayClick?.(e)} className="aspect-video rounded-2xl bg-gray-900 mb-8 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-lg" >
        {course?.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 group-hover:opacity-40 transition-opacity" />

        <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-2xl scale-100 group-hover:scale-110 transition-transform z-10 relative">
          <Play className="h-8 w-8 text-[#2F52E0] fill-[#2F52E0]" />
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#161B1D]">
          {course.title}
        </h1>

        <button onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 cursor-pointer shadow-sm select-none shrink-0 ${isFavorited
              ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
            }`} >
          <Heart className={`h-4 w-4 transition-transform ${isFavorited ? "fill-red-600 text-red-600 scale-110" : ""}`} />
          <span className="hidden sm:inline">
            {isFavorited ? "Favoritado" : "Favoritar"}
          </span>
        </button>
      </div>

      <p className="text-lg text-gray-500 font-light leading-relaxed mb-8">
        {course.description}
      </p>

      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-8">
        <Link href={`/professor/${professorSlug}`}
          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm hover:border-[#2F52E0]/30 hover:bg-blue-50/30 transition-all group/prof cursor-pointer" >
          <User className="h-4 w-4 text-[#2F52E0] group-hover/prof:scale-110 transition-transform" />
          <span className="font-medium text-gray-700 group-hover/prof:text-[#2F52E0] transition-colors">
            {course.professor_name ? formatName(course.professor_name) : "Professor"}
          </span>
        </Link>

        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" /> {totalHours}h de conteúdo
        </span>

        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-400" /> {lessons.length} aulas
        </span>

        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Certificado incluso
        </span>
      </div>
    </div>
  );
}