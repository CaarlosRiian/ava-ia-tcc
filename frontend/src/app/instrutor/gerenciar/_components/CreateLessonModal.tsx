"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Module } from "@/types/course";

interface Props {
  modules: Module[];
  onCreate: (data: FormData) => Promise<void>;
}

export const CreateLessonModal = ({modules, onCreate, }: Props) => {
  const [open, setOpen] = useState(false);

  const [selectedModule, setSelectedModule] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
      setError("");

      if (!selectedModule) {
        setError("Selecione um módulo");
        return;
      }

      if (!title.trim()) {
        setError("Digite o título da aula");
        return;
      }

      const durationSeconds = Number(duration);

      if (isNaN(durationSeconds) || durationSeconds <= 0) {
        setError("Duração inválida");
        return;
      }

      const formData = new FormData();

      formData.append("title", title);
      formData.append("status", "rascunho");
      formData.append("module", selectedModule);
      formData.append(
        "duration_seconds",
        String(durationSeconds)
      );

      if (video) {
        formData.append("video", video);
      }

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      await onCreate(formData);

      setSelectedModule("");
      setTitle("");
      setDuration("");
      setVideo(null);
      setOpen(false);

    } catch (error) {
      console.log(error);
      setError("Erro ao criar aula");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
          Adicionar Aula
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Nova aula</DialogTitle>

          <DialogDescription>
            Preencha os dados da aula e envie o vídeo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 bg-white">
          <select className="w-full border p-2 rounded-md text-sm bg-white cursor-pointer"
            value={selectedModule}
            onChange={(e) =>
              setSelectedModule(e.target.value)
            }
          >
            <option value="">
              Selecione um módulo
            </option>

            {modules.map((module) => (
              <option
                key={module.id}
                value={module.id}
              >
                {module.title}
              </option>
            ))}
          </select>

          <input className="w-full border p-2 rounded-md text-sm" placeholder="Título da aula" value={title} onChange={(e) =>
              setTitle(e.target.value) }
          />

          <input type="number" className="w-full border p-2 rounded-md text-sm"
            placeholder="Duração em segundos" value={duration} onChange={(e) =>
              setDuration(e.target.value) }
          />

          <input type="file" accept="video/mp4" className="w-full border p-2 rounded-md text-sm cursor-pointer" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (
                file.size >
                100 * 1024 * 1024
              ) {
                setError(
                  "Vídeo muito grande. Máximo 100MB."
                );
                return;
              }

              setVideo(file);
            }}
          />

          {error && (
            <p className="text-xs text-red-500 font-medium">
              {error}
            </p>
          )}

          <Button onClick={handleSubmit} className="w-full cursor-pointer" >
            Criar aula
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
};