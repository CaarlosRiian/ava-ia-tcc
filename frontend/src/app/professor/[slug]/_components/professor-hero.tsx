import { BookOpen, Clock, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfessorHeroProps {
  name: string;
  bio: string;
  specialties: string[];
  initials: string;
  stats: {
    coursesCount: number;
    hours: number;
    lessons: number;
  };
}

export function ProfessorHero({ name, bio, specialties, initials, stats }: ProfessorHeroProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start mb-16 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
        <AvatarFallback className="text-3xl font-black bg-[#2F52E0] text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h1 className="text-4xl font-black text-[#161B1D] mb-4 tracking-tight">{name}</h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-2xl">{bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {(specialties || []).map((s) => (
            <span key={s} className="px-4 py-1.5 rounded-full bg-blue-50 text-[#2F52E0] text-sm font-bold border border-blue-100">
              {s}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-8 py-6 border-t border-gray-200">
          <StatItem icon={<BookOpen className="h-5 w-5" />} label="Cursos" value={stats.coursesCount} />
          <StatItem icon={<Clock className="h-5 w-5" />} label="Conteúdo" value={`${stats.hours}h`} />
          <StatItem icon={<Award className="h-5 w-5" />} label="Aulas" value={stats.lessons} />
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-blue-50 p-2 rounded-lg text-[#2F52E0]">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.1em]">{label}</p>
        <p className="text-lg font-black text-[#161B1D] leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}