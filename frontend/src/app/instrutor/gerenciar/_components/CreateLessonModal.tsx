"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Lesson, Module, } from "@/types/course";
import { LessonForm } from "./LessonForm";

interface Props {
  modules: Module[];
  mode?: "create" | "edit";
  lesson?: Lesson;
  trigger?: React.ReactNode;
  onCreate?: (data: FormData) => Promise<void>;
  onUpdate?: (lessonId: string, data: FormData) => Promise<void>;
}

export const CreateLessonModal = ({ modules, mode = "create", lesson, trigger, onCreate, onUpdate, }: Props) => {
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
            variant="outline"
            className="h-9 text-xs font-semibold cursor-pointer"
          >
            Nova Aula
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-white sm:max-w-[800px] w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova aula" : "Editar aula"}
          </DialogTitle>
          <DialogDescription>
            Configure os dados da aula.
          </DialogDescription>
        </DialogHeader>

        <LessonForm
          key={lesson?.id || "create"}
          modules={modules}
          mode={mode}
          lesson={lesson}
          onCreate={handleCreateSubmit}
          onUpdate={handleUpdateSubmit}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};