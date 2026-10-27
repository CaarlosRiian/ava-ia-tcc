import { BookOpen, Award, Users, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfessorHeroProps {
  name: string;
  bio: string;
  initials: string;
  avatarUrl?: string; 
  stats: {
    coursesCount: number;
    students?: number; 
    lessons: number;
    joinedAt?: string; 
  };
}

export function ProfessorHero({ name, bio, initials, avatarUrl, stats }: ProfessorHeroProps) {
  const memberSince = stats.joinedAt || "Jun/2026"; 

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start mb-16 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <Avatar className="h-32 w-32 border-4 border-white shadow-xl overflow-hidden">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover h-full w-full" />}
        
        <AvatarFallback className="text-3xl font-black bg-[#FF7A00] text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
      <h1 className="text-4xl font-black text-[#161B1D] mb-4 tracking-tight">
        {name}
      </h1>

      <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-2xl">
        {bio}
      </p>

      <div className="flex flex-wrap gap-8 py-6 border-t border-gray-200 mt-6">
        <StatItem
          icon={<BookOpen className="h-5 w-5 text-black" />}
          label="Cursos"
          value={stats.coursesCount}
        />

        <StatItem
          icon={<Users className="h-5 w-5 text-black" />}
          label="Alunos"
          value={stats.students ?? 0}
        />

        <StatItem
          icon={<Award className="h-5 w-5 text-black" />}
          label="Aulas"
          value={stats.lessons}
        />

        <StatItem
          icon={<Calendar className="h-5 w-5 text-black" />}
          label="Membro desde"
          value={memberSince}
        />
      </div>
    </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-gray-50 p-2 rounded-lg text-[#FF7A00]">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.1em]">{label}</p>
        <p className="text-lg font-black text-[#161B1D] leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}