"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Video, Eye, Settings, Trash2 } from "lucide-react";

interface Props {
  curso: {
    id: string;
    title: string;
    aulas: any[];
    alunos: number;
  };
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export const CourseCard = ({
  curso,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <Card
      onClick={onClick}
      className={`relative cursor-pointer transition-all border-none shadow-sm group
        ${
          isSelected
            ? "ring-3 ring-[#FF7A00] bg-orange-50/50 shadow-md shadow-orange-500/5"
            : "bg-white"
        }
      `}
    >
      <CardContent className="p-3 pr-16">
        <h3 className="font-bold text-sm line-clamp-1">
          {curso?.title || "Curso sem título"}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-muted-foreground/70 uppercase">
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

        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
            title="Editar curso"
          >
            <Settings size={15} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(); 
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
            title="Excluir curso"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};