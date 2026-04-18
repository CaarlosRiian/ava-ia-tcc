import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, GripVertical, BookOpen } from "lucide-react";
import { CursoGerenciado } from "@/data/types";

interface Props {
  curso: CursoGerenciado | undefined;
  onToggle: (cId: string, aId: string) => void;
  onDelete: (cId: string, aId: string) => void;
}

export const LessonManager = ({ curso, onToggle, onDelete }: Props) => {
  if (!curso) return (
    <div className="h-64 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center text-center p-6 bg-white/50">
      <BookOpen size={40} className="text-gray-200 mb-3" />
      <h3 className="font-bold text-gray-400 text-sm">Selecione um curso</h3>
    </div>
  );

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 p-4 flex-row justify-between items-center space-y-0">
        <div>
          <CardTitle className="text-lg font-bold">{curso.titulo}</CardTitle>
          <CardDescription className="text-xs">{curso.aulas.length} aulas</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold border-gray-200 cursor-pointer">+ Aula</Button>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {curso.aulas.map((aula, index) => (
          <div key={aula.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-white group hover:border-blue-100 transition-all">
            <GripVertical size={14} className="text-gray-300 cursor-grab" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs truncate text-gray-800">{index + 1}. {aula.titulo}</p>
              <p className="text-[10px] font-medium text-gray-400">{aula.duracao}</p>
            </div>
            <Badge
              onClick={() => onToggle(curso.id, aula.id)}
              className={`cursor-pointer text-[9px] uppercase font-black px-2 py-0.5 border-none ${
                aula.status === "publicada" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {aula.status === "publicada" ? "Ativa" : "Rascunho"}
            </Badge>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer"><Pencil size={12} /></Button>
              <Button onClick={() => onDelete(curso.id, aula.id)} variant="ghost" size="icon" className="h-7 w-7 text-red-500"><Trash2 size={12} /></Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};