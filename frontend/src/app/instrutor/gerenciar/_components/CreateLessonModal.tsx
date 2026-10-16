"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Lesson, Module } from "@/types/course";
import { LessonForm } from "./LessonForm";
import { BookOpen } from "lucide-react";

interface Props {
  modules: Module[];
  mode?: "create" | "edit";
  lesson?: Lesson;
  trigger?: React.ReactNode;
  onCreate?: (data: FormData) => Promise<void>;
  onUpdate?: (lessonId: string, data: FormData) => Promise<void>;
}

export const CreateLessonModal = ({ modules, mode = "create", lesson, trigger, onCreate, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);

  const handleCreateSubmit = async (data: FormData) => {
    if (onCreate) {
      await onCreate(data);
      setOpen(false); 
    }
  };

  const handleUpdateSubmit = async (lessonId: string, data: FormData) => {
    if (onUpdate) {
      await onUpdate(lessonId, data);
      setOpen(false); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="bg-[#FF7A00] hover:bg-[#ea7306] text-white h-9 px-4 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition"
          >
            + Nova Aula
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-white sm:max-w-[700px] w-full rounded-3xl p-6 shadow-xl border-none max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-[#FF7A00] rounded-2xl">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-gray-900">
                {mode === "create" ? "Adicionar Nova Aula" : "Editar Aula"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Preencha as informações essenciais para estruturar o conteúdo desta aula.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-4">
          <LessonForm
            key={lesson?.id || "create"}
            modules={modules}
            mode={mode}
            lesson={lesson}
            onCreate={handleCreateSubmit}
            onUpdate={handleUpdateSubmit}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};