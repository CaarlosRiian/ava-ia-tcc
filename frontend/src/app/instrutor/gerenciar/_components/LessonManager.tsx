import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, GripVertical, BookOpen, Settings } from "lucide-react";
import { CreateLessonModal } from "../_components/CreateLessonModal";
import { createLesson } from "@/services/lessons";
import { createModule, updateModule, deleteModule } from "../_services/modules";
import type { CourseAPI, Module, Lesson } from "@/types/course";
import { CreateModuleModal } from "../_components/CreateModuleModal";


type Props = {
  curso?: CourseAPI;
  onToggle: (cId: string, aId: string) => void;
  onDelete: (cId: string, aId: string) => void;
};

export const LessonManager = ({ curso, onToggle, onDelete }: Props) => {

  const [localCurso, setLocalCurso] = useState<CourseAPI | undefined>(curso);

  const handleCreateLesson = async (data: FormData) => {
    try {
      const response = await createLesson(data);
      console.log("AULA CRIADA:", response);
    } catch (error) {
      console.log("ERRO AO CRIAR AULA:", error);
    }
  };

  const handleCreateModule = async (title: string) => {
    try {
      if (!curso?.id) return;

      const lastOrder =
        curso.modules?.length
          ? Math.max(...curso.modules.map(m => m.order))
          : 0;

      const newModule = await createModule({
        title,
        course: Number(curso.id),
        order: lastOrder + 1,
      });

      setLocalCurso((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          modules: [
            ...(prev.modules ?? []),
            {
              ...newModule,
              lessons: [],
            },
          ],
        };
      });

    } catch (error) {
      console.log(error);
    }
  };

  const handleEditModule = async (moduleId: string, title: string) => {
    try {
      const updated = await updateModule(moduleId, { title });

      setLocalCurso((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? { ...m, ...updated }
              : m
          ),
        };
      });

    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteModule(moduleId);

      setLocalCurso((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          modules: prev.modules.filter(
            (m) => m.id !== moduleId
          ),
        };
      });

    } catch (error) {
      console.log(error);
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
      <CardHeader className="border-b border-zinc-100 px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3 flex-1">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-zinc-900 leading-tight">
              {curso.title}
            </CardTitle>

            <CardDescription className="text-sm text-zinc-500 leading-relaxed max-w-2xl
      ">
              {curso.description}
            </CardDescription>
          </div>

          <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 w-fit">
            {(curso.modules ?? []).reduce(
              (acc, mod) => acc + (mod.lessons?.length ?? 0),
              0
            )} aulas
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 shrink-0 pt-1 w-full sm:w-auto">
          <CreateModuleModal
            mode="create"
            onSubmit={handleCreateModule}
          />

          <CreateLessonModal
            modules={curso.modules ?? []}
            onCreate={handleCreateLesson}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {curso.modules.map((module: Module, moduleIndex: number) => (
          <div key={module.id} className="space-y-2 group">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800">
                Módulo {moduleIndex + 1}: {module.title}
              </h3>

              <span className="text-xs text-gray-400">
                ({module.lessons.length} aulas)
              </span>

              <CreateModuleModal
                mode="edit"
                initialValue={module.title}
                onSubmit={(title) => handleEditModule(module.id, title)}
                onDelete={() => handleDeleteModule(module.id)}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Settings size={14} />
                  </Button>
                }
              />
            </div>

            <div className="space-y-2 pl-2 border-l border-gray-100">
              {module.lessons.map((aula: Lesson, index: number) => (
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
                      {aula.duration}
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