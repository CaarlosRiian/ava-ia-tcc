import { Card, CardContent } from "@/components/ui/card";
import { Video, Eye } from "lucide-react";
import { CursoGerenciado } from "@/data/types";

interface Props {
  curso: CursoGerenciado;
  isSelected: boolean;
  onClick: () => void;
}

export const CourseCard = ({ curso, isSelected, onClick }: Props) => (
  <Card
    className={`cursor-pointer transition-all border-none shadow-sm ${
      isSelected ? "ring-2 ring-[#2F52E0] bg-blue-50/50 shadow-md shadow-blue-500/5" : "bg-white"
    }`}
    onClick={onClick}
  >
    <CardContent className="p-3">
      <h3 className="font-bold text-xs line-clamp-1">{curso.titulo}</h3>
      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-muted-foreground/70 uppercase">
        <span className="flex items-center gap-1"><Video size={11} /> {curso.aulas.length} aulas</span>
        <span>•</span>
        <span className="flex items-center gap-1"><Eye size={11} /> {curso.alunos} alunos</span>
      </div>
    </CardContent>
  </Card>
);