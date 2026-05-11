import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, GripVertical, BookOpen } from "lucide-react";
import { CursoGerenciado, ModuloGerenciado, AulaGerenciada } from "@/data/types";
import { CreateLessonModal } from "../_components/CreateLessonModal";
import { createLesson } from "@/services/lessons";

interface Props {
  curso: CursoGerenciado | undefined;
    onToggle: (cId: number, aId: number) => void;
    onDelete: (cId: number, aId: number) => void;
}

  export const LessonManager = ({ curso, onToggle, onDelete }: Props) => {
    const handleCreateLesson = async (data: FormData) => {
      try {
        console.log("ENVIANDO:", [...data.entries()]);

        const response = await createLesson(data);

        console.log("AULA CRIADA:", response);

      } catch (error) {
        console.log("ERRO AO CRIAR AULA:", error);
      }
    };

  if (!curso) return (
    <div className="h-64 border-2 border-gray-200 rounded-[24px] flex flex-col items-center justify-center text-center p-6 bg-white/50">
      <BookOpen size={40} className="text-gray-200 mb-3" />
      <h3 className="font-bold text-gray-400 text-sm">Selecione um curso</h3>
    </div>
  );

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 p-4 flex-row justify-between items-center space-y-0">
        <div>
          <CardTitle className="text-lg font-bold">{curso.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {curso.description}
          </p>
          <CardDescription className="text-xs">{curso.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)} aulas</CardDescription>
        </div>
          <CreateLessonModal
            modules={curso.modules}
            onCreate={handleCreateLesson}
          />
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {curso.modules.map((module: ModuloGerenciado, moduleIndex: number) => (
          <div key={module.id} className="space-y-2">

            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800">
                Módulo {moduleIndex + 1}: {module.title}
              </h3>

              <span className="text-xs text-gray-400">
                ({module.lessons.length} aulas)
              </span>
            </div>

            <div className="space-y-2 pl-2 border-l border-gray-100">
              {module.lessons.map((aula: AulaGerenciada, index: number) => (
                <div
                  key={aula.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-white group hover:border-blue-100 transition-all"
                >
                  <GripVertical size={14} className="text-gray-300 cursor-grab" />

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate text-gray-800">
                      {index + 1}. {aula.title}
                    </p>

                    <p className="text-[10px] font-medium text-gray-400">
                      {aula.duracao}
                    </p>
                  </div>

                  <Badge
                    onClick={() => onToggle(curso.id, aula.id)}
                    className={`cursor-pointer text-[9px] uppercase font-black px-2 py-0.5 border-none ${aula.status === "publicada"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {aula.status === "publicada" ? "Ativa" : "Rascunho"}
                  </Badge>

                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                      <Pencil size={12} />
                    </Button>

                    <Button
                      onClick={() => onDelete(curso.id, aula.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </CardContent>
    </Card>
  );
};