import { Card, CardContent } from "@/components/ui/card";
import { Video, Eye, Pencil } from "lucide-react";

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
}

export const CourseCard = ({
  curso,
  isSelected,
  onClick,
  onEdit,
}: Props) => {
  return (
    <Card
      onClick={onClick}
      className={`relative cursor-pointer transition-all border-none shadow-sm
        ${
          isSelected
            ? "ring-3 ring-[#2F52E0] bg-blue-50/50 shadow-md shadow-blue-500/5"
            : "bg-white"
        }
      `}
    >
      <CardContent className="p-3">
        <h3 className="font-bold text-sm line-clamp-1">
          {curso?.title || "Curso sem título"}
        </h3>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100"
        >
          <Pencil size={14} />
        </button>

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
      </CardContent>
    </Card>
  );
};