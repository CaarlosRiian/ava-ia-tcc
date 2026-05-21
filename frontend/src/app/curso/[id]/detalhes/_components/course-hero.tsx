import Link from "next/link";
import { ArrowLeft, User, Clock, BookOpen } from "lucide-react";
import { formatName } from "@/utils/formatName"; 

interface CourseHeroProps {
  course: {
    title: string;
    description: string;
    thumbnail?: string;
    professor_name?: string;
    hours?: number;
    modules?: any[];
  };
}

export default function CourseHero({ course }: CourseHeroProps) {
  const rawInstructor = course.professor_name || "Instrutor";
  
  const instructor = rawInstructor !== "Instrutor" ? formatName(rawInstructor) : rawInstructor;
  
  const courseHours = course.hours || 40;

  const totalLessons = course.modules?.reduce((acc: number, mod: any) => {
    const lessonsCount = mod.lessons?.length || mod.lessons_count || 0;
    return acc + lessonsCount;
  }, 0) || course.modules?.length || 0;

  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
      {course.thumbnail && (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
      )}
      
      <div className="relative max-w-7xl mx-auto w-full px-6 md:px-2 py-8 md:py-20 text-primary-foreground">
        <Link
          href="/descobrir"
          className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para cursos
        </Link>
        <div className="max-w-3xl">
          <span className="inline-block text-xs uppercase tracking-wider bg-white/15 backdrop-blur px-3 py-1 rounded-full mb-4">
            Curso completo
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{course.title}</h1>
          <p className="text-base md:text-lg text-primary-foreground/90 mb-6 max-w-2xl">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-primary-foreground/90">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {instructor}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {courseHours}h de conteúdo
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> {totalLessons} aulas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}