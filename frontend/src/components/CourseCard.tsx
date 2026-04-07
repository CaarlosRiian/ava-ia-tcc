import { PlayCircle, Clock } from "lucide-react";

interface CourseProps {
  title: string;
  author: string;
  hours: number;
}

export default function CourseCard({ title, author, hours }: CourseProps) {
  return (
    <div className="group bg-white border border-gray-300 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer">
      <div className="h-40 bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
        <PlayCircle className="text-gray-300 group-hover:text-[#2F52E0] w-12 h-12 transition-all" />
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-[#161B1D] mb-1 group-hover:text-[#2F52E0] transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-gray-400 mb-4">por {author}</p>
        
        <div className="flex items-center text-xs text-gray-400 gap-1 font-medium">
          <Clock size={14} />
          {hours} horas de conteúdo
        </div>
      </div>
    </div>
  );
}