"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LessonChallengeModal } from "./LessonChallengeModal"; 
import { LessonBasicInfo } from "./_lessons/LessonBasicInfo";
import { LessonVideoUpload } from "./_lessons/LessonVideoUpload";
import { LessonThumbnailUpload } from "./_lessons/LessonThumbnailUpload";
import { LessonChallengeSection } from "./_lessons/LessonChallengeSection";
import type { Lesson, Module } from "@/types/course";
import { Loader2 } from "lucide-react";
import { uploadMedia } from "@/lib/uploadMedia";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  modules: Module[];
  courseId: string | number;
  mode: "create" | "edit";
  lesson?: Lesson;
  onCreate?: (data: FormData) => Promise<void>;
  onUpdate?: (lessonId: string, data: FormData) => Promise<void>;
  onSuccess?: () => void;
  onShowToast?: (msg: string, type?: "success" | "error") => void;
}

export const LessonForm = ({ modules, courseId, mode, lesson, onCreate, onUpdate, onSuccess, onShowToast }: Props) => {
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
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
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
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoPreviewName(file.name);
    }
  };

  async function handleSubmit() {
    try {
      setError("");
      setLoading(true);

      if (!selectedModule && mode === "create") {
        setError("Selecione um módulo");
        setLoading(false);
        return;
      }

      if (!title.trim()) {
        setError("Digite o título da aula");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("status", "publicada");
      formData.append("visibility", visibility);

      if (selectedModule) {
        formData.append("module", selectedModule);
      }

      if (video) {
        setUploadStatus("Enviando vídeo para o Supabase Storage...");
        const rawLesson = lesson as any;
        if (mode === "edit" && rawLesson?.video_url) {
          await supabase.storage.from("course-lessons").remove([rawLesson.video_url]);
        }

        const uploadResult = await uploadMedia({
          bucket: "course-lessons",
          file: video,
          folder: `courses/${courseId}/lessons`,
        });

        formData.append("video", uploadResult.path);
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

      setUploadStatus("Salvando dados da aula...");

      if (mode === "create" && onCreate) {
        await onCreate(formData);
        onShowToast?.("Aula criada com sucesso!");
      }

      if (mode === "edit" && lesson && onUpdate) {
        await onUpdate(lesson.id, formData);
        onShowToast?.("Aula atualizada com sucesso!");
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(mode === "create" ? "Erro ao criar aula" : "Erro ao atualizar aula");
      onShowToast?.("Erro ao processar a aula. Tente novamente.", "error");
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  }

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          <LessonBasicInfo
            modules={modules}
            selectedModule={selectedModule}
            onModuleChange={setSelectedModule}
            title={title}
            onTitleChange={setTitle}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            disabled={loading}
          />

          <LessonVideoUpload
            videoPreviewName={videoPreviewName}
            onVideoChange={handleVideoChange}
            onRemoveVideo={() => { setVideo(null); setVideoPreviewName(null); }}
            disabled={loading}
          />

          <LessonThumbnailUpload
            mode={mode}
            thumbPreview={thumbPreview}
            onThumbChange={handleThumbChange}
            onRemoveThumb={() => { setThumbnail(null); setThumbPreview(null); }}
            disabled={loading}
          />

          <LessonChallengeSection
            challengeEnabled={challengeEnabled}
            onOpenModal={() => setIsChallengeModalOpen(true)}
            disabled={loading}
          />
        </div>

        {error && <p className="text-xs text-red-500 font-semibold text-center">{error}</p>}

        <div className="pt-2 pb-1">
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full h-11 bg-[#FF7A00] hover:bg-[#ea7306] text-white font-bold rounded-xl cursor-pointer shadow-sm transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? uploadStatus || "Salvando..." : mode === "create" ? "Criar Aula" : "Salvar Alterações"}
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
          onRemove={() => {
            setChallengeEnabled(false);
            setChallengeTitle("");
            setChallengeDescription("");
            setChallengeCriteria("");
            setIsChallengeModalOpen(false);
          }}
        />
      </div>
    </>
  );
};