"use client";

import { PlayCircle, Clock } from "lucide-react";
import Link from "next/link"; // 1. Importar o Link

interface CourseProps {
  id: number;      // 2. Adicionar o ID às props
  title: string;
  author: string;
  hours: number;
  progress?: number; 
}

export default function CourseCard({ id, title, author, hours, progress }: CourseProps) {
  return (
    // 3. Envolver tudo com o Link apontando para a rota dinâmica /curso/[id]
    <Link href={`/curso/${id}`} className="block h-full">
      <div className="group bg-white border border-gray-300 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full">
        <div className="h-40 bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors relative">
          <PlayCircle className="text-gray-300 group-hover:text-[#2F52E0] w-12 h-12 transition-all" />
          
          {progress !== undefined && (
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#2F52E0]">
              {progress}% concluído
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-[#161B1D] mb-1 group-hover:text-[#2F52E0] transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-gray-400 mb-4">por {author}</p>
          
          <div className="mt-auto">
            {progress !== undefined ? (
              <div className="space-y-1.5">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#2F52E0] h-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center text-xs text-gray-400 gap-1 font-medium">
                <Clock size={14} />
                {hours} horas de conteúdo
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}