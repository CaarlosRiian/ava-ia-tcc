import Link from "next/link";
import { ArrowLeft, User, BookOpen, Heart } from "lucide-react";
import { formatName } from "@/utils/formatName"; 

interface CourseHeroProps {
  course: {
    title: string;
    description: string;
    thumbnail?: string;
    professor_name?: string;
    professor_slug?: string; 
    hours?: number;
    modules?: any[];
  };
  isInWishlist?: boolean;
  onToggleWishlist?: () => void;
}

export default function CourseHero({ course, isInWishlist = false, onToggleWishlist }: CourseHeroProps) {
  const rawInstructor = course.professor_name || "Instrutor";
  
  const instructor = rawInstructor !== "Instrutor" ? formatName(rawInstructor) : rawInstructor;
  
  const professorSlug = course.professor_slug || "perfil";

  const totalLessons = course.modules?.reduce((acc: number, mod: any) => {
    const lessonsCount = mod.lessons?.length || mod.lessons_count || 0;
    return acc + lessonsCount;
  }, 0) || course.modules?.length || 0;

  return (
    <section className="relative overflow-hidden border-b border-gray-800">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      
      {course.thumbnail && (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-20 filter blur-[2px]"
        />
      )}

      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      
      <div className="relative max-w-7xl mx-auto w-full px-6 md:px-2 py-8 md:py-20 text-white">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/descobrir"
            className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para cursos
          </Link>

          {onToggleWishlist && (
            <button
              onClick={onToggleWishlist}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer border ${
                isInWishlist
                  ? "bg-red-500/20 text-red-200 border-red-500/40 hover:bg-red-500/30"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isInWishlist ? "fill-red-400 text-red-400" : ""}`} />
              <span>{isInWishlist ? "Salvo nos Desejos" : "Salvar na Lista"}</span>
            </button>
          )}
        </div>

        <div className="max-w-3xl">
          <span className="inline-block text-xs uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full mb-4 text-gray-200 font-medium">
            Curso completo
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 text-white tracking-tight">{course.title}</h1>
          <p className="text-base md:text-lg text-gray-300 mb-6 max-w-2xl font-light">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-300 font-medium">
            <Link 
              href={`/professor/${professorSlug}`} 
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors group cursor-pointer"
            >
              <User className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              <span>{instructor}</span>
            </Link>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-gray-400" /> {totalLessons} aulas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}