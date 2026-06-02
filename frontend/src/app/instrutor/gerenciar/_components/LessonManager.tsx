"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings, Plus } from "lucide-react";
import { createLesson, updateLesson, deleteLesson } from "@/services/lessons";
import { updateModule, deleteModule } from "../_services/modules";
import type { CourseAPI, Module } from "@/types/course";
import { CreateModuleModal } from "../_components/CreateModuleModal";
import { ModuleLessons } from "../_components/ModuleLessons";

type Props = {
  curso?: CourseAPI;
  onToggle: (cId: string, aId: string) => void;
  onDelete: (cId: string, aId: string) => void;
  onOpenAddOptions: () => void;
};

export const LessonManager = ({ curso, onToggle, onDelete, onOpenAddOptions }: Props) => {
  const [localCurso, setLocalCurso] = useState<CourseAPI | undefined>(curso);

  useEffect(() => {
    if (curso) {
      setLocalCurso(curso);
    }
  }, [curso]);

  const handleUpdateLesson = async (lessonId: string, formData: FormData) => {
    try {
      await updateLesson(lessonId, formData);
      setLocalCurso((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId
                ? { ...l, ...Object.fromEntries(formData.entries()) }
                : l
            ),
          })),
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteLesson = async (cursoId: string, lessonId: string) => {
    try {
      await deleteLesson(lessonId);
      setLocalCurso((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) => ({
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lessonId),
          })),
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
            m.id === moduleId ? { ...m, ...updated } : m
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
          modules: prev.modules.filter((m) => m.id !== moduleId),
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!localCurso) return (
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
              {localCurso.title}
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 leading-relaxed max-w-2xl ">
              {localCurso.description}
            </CardDescription>
          </div>
          <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 w-fit">
            {(localCurso.modules ?? []).reduce(
              (acc, mod) => acc + (mod.lessons?.length ?? 0),
              0
            )} aulas
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 shrink-0 pt-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenAddOptions}
            className="bg-[#2F52E0] hover:bg-[#1e3bb3] h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer shadow-sm text-white transition flex items-center justify-center gap-1.5"
          >
            <Plus size={16} /> Adicionar Conteúdo
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {localCurso.modules.map((module: Module, moduleIndex: number) => (
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
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Settings size={14} />
                  </Button>
                }
              />
            </div>

            <div className="space-y-2 pl-2 border-l border-gray-100">
              <ModuleLessons
                lessons={module.lessons ?? []}
                cursoId={localCurso.id}
                modules={localCurso.modules ?? []}
                onToggle={onToggle}
                onDelete={handleDeleteLesson}
                onUpdate={handleUpdateLesson}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};