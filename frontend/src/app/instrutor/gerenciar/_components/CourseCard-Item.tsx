"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Video, Eye, Settings, Trash2, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  curso: {
    id: string;
    title: string;
    thumbnail?: string | null;
    aulas: any[];
    alunos: number;
  };
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

function getThumbnailUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const { data } = supabase.storage
    .from("course-thumbnails")
    .getPublicUrl(path);
  return data.publicUrl;
}

export const CourseCard = ({
  curso,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: Props) => {
  const thumbnailUrl = getThumbnailUrl(curso?.thumbnail);

  return (
    <Card
      onClick={onClick}
      className={`relative cursor-pointer transition-all border-none shadow-sm group overflow-hidden
        ${
          isSelected
            ? "ring-3 ring-[#FF7A00] bg-white shadow-md shadow-orange-500/5"
            : "bg-white hover:shadow-md"
        }
      `}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className="w-16 h-14 rounded-xl bg-zinc-100 flex-shrink-0 overflow-hidden relative border border-zinc-200/60 flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={curso?.title || "Capa do curso"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <BookOpen className="w-5 h-5 text-zinc-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-14">
          <h3 className="font-bold text-xs sm:text-sm line-clamp-1 text-zinc-800 group-hover:font-extrabold transition-all">
            {curso?.title || "Curso sem título"}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-zinc-400 uppercase">
            <span className="flex items-center gap-1">
              <Video size={11} />
              {curso?.aulas?.length || 0} aulas
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <Eye size={11} />
              {curso?.alunos || 0} alunos
            </span>
          </div>
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/80 backdrop-blur-xs p-1 rounded-xl shadow-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
            title="Editar curso"
          >
            <Settings size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(); 
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition cursor-pointer"
            title="Excluir curso"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};