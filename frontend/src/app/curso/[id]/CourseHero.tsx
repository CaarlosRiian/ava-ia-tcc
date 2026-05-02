import { Clock, User, BookOpen, CheckCircle2, Play } from "lucide-react";

interface CourseHeroProps {
  course: any;
}

export default function CourseHero({ course }: CourseHeroProps) {
  const lessons = course.modules?.flatMap((m: any) => m.lessons) || [];

  const totalSeconds = lessons.reduce(
    (acc: number, lesson: any) => acc + lesson.duration_seconds,
    0
  );

  const totalHours = (totalSeconds / 3600).toFixed(1);

  return (
    <div className="lg:col-span-2">
      <div className="aspect-video rounded-2xl bg-gray-200 mb-8 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2F52E0]/20 to-purple-500/20 group-hover:opacity-70 transition-opacity" />
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-2xl scale-100 group-hover:scale-110 transition-transform z-10">
          <Play className="h-8 w-8 text-[#2F52E0] fill-[#2F52E0]" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-[#161B1D] mb-4">
        {course.title}
      </h1>

      <p className="text-lg text-gray-500 font-light leading-relaxed mb-8">
        {course.description}
      </p>

      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-8">
        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
          <User className="h-4 w-4 text-[#2F52E0]" />
          <span className="font-medium text-gray-700">
            {course.professor_name}
          </span>
        </span>

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