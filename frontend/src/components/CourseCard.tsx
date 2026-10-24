"use client";

import { PlayCircle, BookOpen, Clock, Heart } from "lucide-react";
import Link from "next/link"; 
import { supabase } from "@/lib/supabaseClient";

interface CourseProps {
  id: number;      
  title: string;
  author: string;
  hours?: number;          
  lessonsCount?: number;   
  progress?: number; 
  slug?: string;
  thumbnail?: string | null;
  price?: any;

  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export default function CourseCard({ id, title, author, hours, lessonsCount, progress, 
  thumbnail, price, showFavoriteButton = false, isFavorite = false, onToggleFavorite 
}: CourseProps) {
  const numericPrice = price ? Number(price) : 0;
  const isFree = !price || numericPrice === 0;

  const getImageUrl = (thumb?: string | null) => {
    if (!thumb || typeof thumb !== "string" || thumb.trim() === "") return null;
    
    if (thumb.startsWith("http://") || thumb.startsWith("https://")) {
      return thumb;
    }
    
    const { data } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(thumb);
      
    return data.publicUrl;
  };

  const finalThumbnail = getImageUrl(thumbnail);

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
          {finalThumbnail ? (
            <img 
              src={finalThumbnail} 
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
          
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            {progress !== undefined ? (
              <div className="w-full space-y-1.5">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#2F52E0] h-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
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

                <div>
                  {isFree ? (
                    <span className="text-xs font-bold text-[#FF7A00] bg-orange-50 px-2.5 py-1 rounded-md">
                      Gratuito
                    </span>
                  ) : (
                    <span className="text-sm font-extrabold text-[#161B1D]">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(numericPrice)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}