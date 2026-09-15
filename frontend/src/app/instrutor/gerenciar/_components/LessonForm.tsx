"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Lesson, Module } from "@/types/course";

interface Props {
  modules: Module[];
  mode: "create" | "edit";
  lesson?: Lesson;
  onCreate?: (data: FormData) => Promise<void>;
  onUpdate?: (lessonId: string, data: FormData) => Promise<void>;
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

  const [challengeEnabled, setChallengeEnabled] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeCriteria, setChallengeCriteria] = useState("");

  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {

    if (mode === "edit" && lesson) {
      setTitle(lesson.title ?? "");
      setStatus(lesson.status ?? "rascunho");
      setVisibility(lesson.visibility ?? "privado");
      setSelectedModule(lesson.module ?? "");

      const rawLesson = lesson as any;
      const ch = rawLesson.challenge;

      if (ch) {
        setChallengeEnabled(true);
        setChallengeTitle(ch.title ?? "");
        setChallengeDescription(ch.description ?? "");
        setChallengeCriteria(ch.evaluation_criteria ?? "");
      } else {
        setChallengeEnabled(false);
        setChallengeTitle("");
        setChallengeDescription("");
        setChallengeCriteria("");
      }
    } else {
      setTitle("");
      setStatus("rascunho");
      setVisibility("privado");
      setSelectedModule("");
      setChallengeEnabled(false);
      setChallengeTitle("");
      setChallengeDescription("");
      setChallengeCriteria("");
    }
    setVideo(null);
    setThumbnail(null);
  }, [lesson, mode]);

  function handleRemoveChallenge() {
    setChallengeEnabled(false);
    setChallengeTitle("");
    setChallengeDescription("");
    setChallengeCriteria("");
    setIsChallengeModalOpen(false);
  }

  async function handleSubmit() {
    try {
      setError("");

      if (!selectedModule && mode === "create") {
        setError("Selecione um módulo");
        return;
      }

      if (!title.trim()) {
        setError("Digite o título da aula");
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

      formData.append("has_challenge", String(challengeEnabled));
      if (challengeEnabled) {
        formData.append("challenge_title", challengeTitle);
        formData.append("challenge_description", challengeDescription);
        formData.append("challenge_criteria", challengeCriteria);
      }

      if (mode === "create" && onCreate) {
        await onCreate(formData);
      }

      if (mode === "edit" && lesson && onUpdate) {
        await onUpdate(lesson.id, formData);
      }

      onSuccess?.();
    } catch (err) {
      setError(
        mode === "create" ? "Erro ao criar aula" : "Erro ao atualizar aula"
      );
    }
  }

  return (
    <div className="space-y-5 max-h-[85vh] overflow-y-auto pr-1">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1 block">Módulo</label>
          <select
            className="w-full border p-2.5 rounded-xl text-sm bg-white"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="">Selecione um módulo</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1 block">Título da Aula</label>
          <input
            className="w-full border p-2.5 rounded-xl text-sm"
            placeholder="Ex: Introdução ao tema"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm bg-white"
            >
              <option value="rascunho">Rascunho</option>
              <option value="publicada">Publicada</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600 mb-1 block">Visibilidade</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm bg-white"
            >
              <option value="privado">Privado</option>
              <option value="publico">Público</option>
            </select>
          </div>
        </div>

        {mode === "create" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Vídeo da Aula</label>
            <input
              type="file"
              accept="video/*"
              className="w-full border p-2 rounded-xl text-sm bg-white file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            {mode === "create" ? "Capa do vídeo" : "Alterar Capa (Opcional)"}
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2 rounded-xl text-sm bg-white file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          />
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-200/60">
          <div>
            <p className="text-xs font-semibold text-zinc-800">Atividade Prática com IA</p>
            <p className="text-[11px] text-zinc-500">
              {challengeEnabled ? "Configurada com sucesso" : "Opcional (Desativada)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsChallengeModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-100 transition shadow-sm cursor-pointer"
          >
            {challengeEnabled ? "Editar Atividade" : "Configurar Atividade"}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <div className="pt-2">
        <Button onClick={handleSubmit} className="w-full py-2.5 rounded-xl cursor-pointer">
          {mode === "create" ? "Criar aula" : "Salvar alterações"}
        </Button>
      </div>

      <Dialog open={isChallengeModalOpen} onOpenChange={setIsChallengeModalOpen}>
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar Atividade Prática</DialogTitle>
            <DialogDescription>
              Defina o desafio e os critérios para feedback automático da IA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <span className="text-xs font-medium text-zinc-700">Habilitar atividade nesta aula</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={challengeEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setChallengeEnabled(checked);
                    if (!checked) {
                      setChallengeTitle("");
                      setChallengeDescription("");
                      setChallengeCriteria("");
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {challengeEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 mb-1 block">Título da Atividade</label>
                  <input
                    className="w-full border p-2 rounded-xl text-sm bg-white"
                    placeholder="Ex: Análise do Caso Prático"
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 mb-1 block">Enunciado da Questão</label>
                  <textarea
                    rows={3}
                    className="w-full border p-2 rounded-xl text-sm bg-white resize-none"
                    placeholder="Descreva o que o aluno deve analisar..."
                    value={challengeDescription}
                    onChange={(e) => setChallengeDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 mb-1 block">Gabarito / Resposta Esperada</label>
                  <textarea
                    rows={2}
                    className="w-full border p-2 rounded-xl text-sm bg-white resize-none"
                    placeholder="Ex: O aluno precisa citar os conceitos centrais..."
                    value={challengeCriteria}
                    onChange={(e) => setChallengeCriteria(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {challengeEnabled ? (
              <button type="button" onClick={handleRemoveChallenge} className="px-4 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-200 rounded-lg transition shadow-sm cursor-pointer" >
                Remover Atividade
              </button>
            ) : (
              <div />
            )}

            <Button type="button" variant="outline" onClick={() => setIsChallengeModalOpen(false)} className="cursor-pointer text-xs h-9" >
              Concluir / Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};