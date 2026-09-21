"use client";

import { PlayCircle, BookOpen, Clock, Heart } from "lucide-react";
import Link from "next/link"; 

interface CourseProps {
  id: number;      
  title: string;
  author: string;
  hours?: number;          
  lessonsCount?: number;   
  progress?: number; 
  thumbnail?: string;

  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export default function CourseCard({ 
  id, 
  title, 
  author, 
  hours, 
  lessonsCount, 
  progress, 
  thumbnail, 
  showFavoriteButton = false, 
  isFavorite = false, 
  onToggleFavorite 
}: CourseProps) {
  return (
    <Link href={`/curso/${id}`} className="block h-full">
      <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full relative">

        {showFavoriteButton && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(e);
            }}
            className="absolute top-3 right-3 z-10"
          >
            <Heart
              className={`w-7 h-7 transition-all cursor-pointer ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-300 hover:text-red-400"
              }`}
            />
          </button>
        )}

        <div className="h-40 bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors relative overflow-hidden">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <PlayCircle className="text-gray-300 group-hover:text-[#2F52E0] w-12 h-12 transition-all" />
          )}
          
          {progress !== undefined && (
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#2F52E0] z-10">
              {progress}% concluído
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-[#161B1D] mb-1 group-hover:text-[#161B1D] transition-colors line-clamp-1">
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
                {lessonsCount !== undefined && lessonsCount > 0 ? (
                  <>
                    <BookOpen size={14} className="text-[#FF7A00]" />
                    <span>{lessonsCount} {lessonsCount === 1 ? 'aula' : 'aulas'}</span>
                  </>
                ) : (
                  <>
                    <Clock size={14} className="text-gray-300" />
                    <span className="text-gray-400/80">Nenhuma aula</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}