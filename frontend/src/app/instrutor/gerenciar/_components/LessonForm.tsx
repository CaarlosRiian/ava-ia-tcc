"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Lesson, Module, } from "@/types/course";

interface Props {
  modules: Module[];

  mode: "create" | "edit";

  lesson?: Lesson;

  onCreate?: (
    data: FormData
  ) => Promise<void>;

  onUpdate?: (
    lessonId: string,
    data: FormData
  ) => Promise<void>;

  onSuccess?: () => void;
}

export const LessonForm = ({ modules, mode, lesson, onCreate, onUpdate, onSuccess,
}: Props) => {

  const [selectedModule, setSelectedModule] = useState("");

  const [title, setTitle] = useState("");

  const [status, setStatus] = useState("rascunho");

  const [visibility, setVisibility] = useState("privado");

  const [video, setVideo] = useState<File | null>(null);

  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && lesson) {
      setTitle(lesson.title ?? "");
      setStatus(lesson.status ?? "rascunho");
      setVisibility(lesson.visibility ?? "privado");
      setSelectedModule(lesson.module ?? "");
    } else {
      setTitle("");
      setStatus("rascunho");
      setVisibility("privado");
      setSelectedModule("");
    }
      setVideo(null);
      setThumbnail(null);
  }, [lesson, mode, open]);

  async function handleSubmit() {
    try {
      setError("");

      if (
        !selectedModule &&
        mode === "create"
      ) {
        setError(
          "Selecione um módulo"
        );

        return;
      }

      if (!title.trim()) {
        setError(
          "Digite o título da aula"
        );

        return;
      }

      const formData = new FormData();

      formData.append("title", title);
      formData.append("status", status);
      formData.append("visibility", visibility);

      if (selectedModule) {
        formData.append("module", selectedModule);
      }

      if (mode === "create" && video) {
        formData.append("video", video);
      }

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (mode === "create" && onCreate) {
        await onCreate(formData);
      }

      if (mode === "edit" && lesson && onUpdate) {
        await onUpdate(lesson.id, formData);
      }

      onSuccess?.();

    } catch (error) {
      console.log(error);

      setError(
        mode === "create"
          ? "Erro ao criar aula"
          : "Erro ao atualizar aula"
      );
    }
  }

  console.log(lesson);

  return (
    <div className="space-y-4">

      <select
        className="w-full border p-2 rounded-lg text-sm"
        value={selectedModule}
        onChange={(e) =>
          setSelectedModule(
            e.target.value
          )
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

      <input
        className="w-full border p-2 rounded-lg text-sm"
        placeholder="Título da aula"
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
          className="border p-2 rounded-lg text-sm "
        >
          <option value="rascunho">
            Rascunho
          </option>
          <option value="publicada">
            Publicada
          </option>
        </select>

        <select
          value={visibility}
          onChange={(e) =>
            setVisibility(
              e.target.value
            )
          }
          className="border p-2 rounded-lg text-sm"
        >
          <option value="privado">
            Privado
          </option>

          <option value="publico">
            Público
          </option>
        </select>
      </div>

      {mode === "create" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Vídeo da Aula</label>
          <input type="file" accept="video/*" className="w-full border p-2 rounded-lg text-sm bg-white file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">
          {mode === "create" ? "Capa do vídeo" : "Alterar Capa do vídeo (Opcional)"}
        </label>
        <input type="file" accept="image/*" className="w-full border p-2 rounded-lg text-sm bg-white file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full"
      >
        {mode === "create"
          ? "Criar aula"
          : "Salvar alterações"}
      </Button>
    </div>
  );
};