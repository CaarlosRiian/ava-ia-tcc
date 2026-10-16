"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LessonChallengeModal } from "./LessonChallengeModal"; 
import type { Lesson, Module } from "@/types/course";
import { Trash2, Upload, Image as ImageIcon, Video as VideoIcon, Globe, Lock } from "lucide-react";

interface Props {
  modules: Module[];
  mode: "create" | "edit";
  lesson?: Lesson;
  onCreate?: (data: FormData) => Promise<void>;
  onUpdate?: (lessonId: string, data: FormData) => Promise<void>;
  onSuccess?: () => void;
}

export const LessonForm = ({ modules, mode, lesson, onCreate, onUpdate, onSuccess }: Props) => {
  const [selectedModule, setSelectedModule] = useState("");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("publico");
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreviewName, setVideoPreviewName] = useState<string | null>(null);

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const [challengeEnabled, setChallengeEnabled] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeCriteria, setChallengeCriteria] = useState("");

  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && lesson) {
      setTitle(lesson.title ?? "");
      setSelectedModule(lesson.module ?? "");
      
      const rawLesson = lesson as any;
      if (rawLesson.visibility) {
        setVisibility(rawLesson.visibility);
      }

      if (lesson.thumbnail) {
        if (lesson.thumbnail.startsWith("http://") || lesson.thumbnail.startsWith("https://")) {
          setThumbPreview(lesson.thumbnail);
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "").replace(/\/$/, "") || "";
          const thumbUrl = lesson.thumbnail.startsWith("/") ? lesson.thumbnail : `/${lesson.thumbnail}`;
          setThumbPreview(`${baseUrl}${thumbUrl}`);
        }
      } else {
        setThumbPreview(null);
      }

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
      setSelectedModule("");
      setVisibility("publico");
      setThumbPreview(null);
      setVideoPreviewName(null);
      setChallengeEnabled(false);
      setChallengeTitle("");
      setChallengeDescription("");
      setChallengeCriteria("");
    }
    setVideo(null);
    setThumbnail(null);
  }, [lesson, mode]);

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const objectUrl = URL.createObjectURL(file);
      setThumbPreview(objectUrl);
    }
  };

  const handleRemoveThumb = () => {
    setThumbnail(null);
    setThumbPreview(null);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoPreviewName(file.name);
    }
  };

  const handleRemoveVideo = () => {
    setVideo(null);
    setVideoPreviewName(null);
  };

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
      formData.append("status", "publicada");
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
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>

      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
              Módulo
            </label>
            <select
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
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
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
              Título da Aula
            </label>
            <input
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              placeholder="Ex: Introdução ao tema"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
              Visibilidade
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("publico")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  visibility === "publico"
                    ? "border-[#FF7A00] bg-orange-50/50 text-[#FF7A00]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Globe className="h-4 w-4" /> Público
              </button>
              <button
                type="button"
                onClick={() => setVisibility("privado")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  visibility === "privado"
                    ? "border-[#FF7A00] bg-orange-50/50 text-[#FF7A00]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Lock className="h-4 w-4" /> Privado
              </button>
            </div>
          </div>

          {mode === "create" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                Vídeo da Aula
              </label>
              {videoPreviewName ? (
                <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 bg-orange-50 text-[#FF7A00] rounded-xl shrink-0">
                      <VideoIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      {videoPreviewName}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveVideo}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs h-8 px-3 rounded-xl shadow-none cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover
                  </Button>
                </div>
              ) : (
                <div className="border-2 border border-gray-200 rounded-2xl p-4 text-center hover:border-[#FF7A00]/50 transition-colors bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-800">Selecione o arquivo de vídeo</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 mb-3">Formatos suportados: MP4, WebM</p>
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <span className="bg-[#FF7A00] hover:bg-[#ea7306] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all">
                      <Upload className="h-3.5 w-3.5" /> Escolher Vídeo
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              {mode === "create" ? "Capa do Vídeo" : "Alterar Capa (Opcional)"}
            </label>

            {thumbPreview ? (
              <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2 shadow-sm">
                <img
                  src={thumbPreview}
                  alt="Capa do vídeo"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
                  <label className="cursor-pointer bg-white text-gray-900 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md hover:bg-gray-100 transition">
                    Trocar Imagem
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbChange}
                      className="hidden"
                    />
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemoveThumb}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-md cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border border-gray-200 rounded-2xl p-4 text-center hover:border-[#FF7A00]/50 transition-colors bg-gray-50/50">
                <div className="p-2.5 bg-white shadow-sm rounded-xl w-fit mx-auto mb-1.5 text-[#FF7A00]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-gray-800">Carregar imagem de capa</p>
                <p className="text-[10px] text-gray-400 mt-0.5 mb-3">Recomendado: 1280x720px (PNG, JPG)</p>
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbChange}
                    className="hidden"
                  />
                  <span className="bg-[#FF7A00] hover:bg-[#ea7306] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all">
                    <Upload className="h-3.5 w-3.5" /> Escolher Ficheiro
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
            <div>
              <p className="text-xs font-bold text-gray-800">Atividade Prática com IA</p>
              <p className="text-[11px] text-gray-500">
                {challengeEnabled ? "Configurada com sucesso" : "Opcional (Desativada)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChallengeModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition shadow-sm cursor-pointer"
            >
              {challengeEnabled ? "Editar Atividade" : "Configurar Atividade"}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 font-semibold text-center">{error}</p>}

        <div className="pt-2 pb-1">
          <Button 
            onClick={handleSubmit} 
            className="w-full h-11 bg-[#FF7A00] hover:bg-[#ea7306] text-white font-bold rounded-xl cursor-pointer shadow-sm transition"
          >
            {mode === "create" ? "Criar Aula" : "Salvar Alterações"}
          </Button>
        </div>

        <LessonChallengeModal
          isOpen={isChallengeModalOpen}
          onOpenChange={setIsChallengeModalOpen}
          challengeEnabled={challengeEnabled}
          setChallengeEnabled={setChallengeEnabled}
          challengeTitle={challengeTitle}
          setChallengeTitle={setChallengeTitle}
          challengeDescription={challengeDescription}
          setChallengeDescription={setChallengeDescription}
          challengeCriteria={challengeCriteria}
          setChallengeCriteria={setChallengeCriteria}
          onRemove={handleRemoveChallenge}
        />
      </div>
    </>
  );
};