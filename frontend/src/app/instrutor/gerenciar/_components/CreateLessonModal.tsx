"use client";

import {Dialog,DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  cursoId: string;
  onCreate: (data: {
    title: string;
    duracao: string;
    status: "publicada" | "rascunho";
  }) => void;
}

export const CreateLessonModal = ({ cursoId, onCreate }: Props) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [duracao, setDuracao] = useState("");

  function handleSubmit() {
    onCreate({
      title,
      duracao,
      status: "rascunho",
    });

    setTitle("");
    setDuracao("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[11px] font-bold border-gray-200"
        >
          + Aula
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova aula</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <input
            className="w-full border p-2 rounded-md text-sm"
            placeholder="Título da aula"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded-md text-sm"
            placeholder="Duração (ex: 10:30)"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
          />

          <Button onClick={handleSubmit} className="w-full">
            Criar aula
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};