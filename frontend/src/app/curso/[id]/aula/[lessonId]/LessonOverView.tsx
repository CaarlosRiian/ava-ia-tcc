"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle, Award, FileText, Link2, Download, AlertCircle } from "lucide-react";
import { completeLesson } from "@/services/courses";
import LessonChallenge from "../_components/LessonChallenge";

export interface LessonOverviewProps {
  course: any;
  lesson: any;
  lessonIndex: number;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  prevLesson?: any;
  nextLesson?: any;
  onEmitirCertificado: () => Promise<void>;
  isGeneratingCertificate: boolean;
  courseProgress: number;
  onLessonCreateOrComplete?: () => void;
  certificateError?: string | null;
}

export default function LessonOverview({
  course, lesson, lessonIndex, aiOpen, setAiOpen,
  prevLesson, nextLesson,
  onEmitirCertificado, isGeneratingCertificate, courseProgress,
  onLessonCreateOrComplete, certificateError,
}: LessonOverviewProps) {
  const [isCompleted, setIsCompleted] = useState(lesson?.is_completed || lesson?.completed || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    try {
      const username = localStorage.getItem("username");
      if (course?.professor && (course.professor === username || course.professor.username === username)) {
        setIsInstructor(true);
      }
    } catch (e) {
    }
  }, [course]);

  const handleComplete = async () => {
    if (isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeLesson(lesson.id);
      setIsCompleted(true);
      lesson.completed = true;

      if (onLessonCreateOrComplete) {
        onLessonCreateOrComplete();
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao salvar o progresso da aula.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const listagemMateriais = lesson.materials || [];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <Link
            href={`/curso/${course.id}`}
            className="text-xs font-bold text-[#2F52E0] hover:underline flex items-center gap-1 mb-3 uppercase tracking-wider"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar ao curso
          </Link>

          <h1 className="text-2xl md:text-3xl font-black text-[#161B1D]">
            {lessonIndex + 1}. {lesson.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting || isCompleted}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer active:scale-95 disabled:pointer-events-none ${
              isCompleted
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <CheckCircle className={`h-4 w-4 ${isCompleted ? "fill-green-600 text-white" : ""}`} />
            {isCompleted ? "Concluída" : isSubmitting ? "Salvando..." : "Concluir Aula"}
          </button>

          <button
            type="button"
            onClick={() => setAiOpen(!aiOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer active:scale-95 ${
              aiOpen ? "bg-gray-100 text-gray-600" : "bg-[#2F52E0] text-white hover:opacity-90"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Assistente IA
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-8 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">Materiais de Apoio</h3>

        {listagemMateriais.length === 0 ? (
          <p className="text-xs text-gray-400">Nenhum material complementar cadastrado para esta aula.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listagemMateriais.map((material: any) => {
              const isLink = material.material_type === "link" || material.type === "link";

              let urlFinal = "";
              if (isLink) {
                urlFinal = material.raw_content || material.url;
              } else if (material.file) {
                urlFinal = material.file.startsWith("http") ? material.file : `${apiBaseUrl}${material.file}`;
              } else if (material.raw_content) {
                urlFinal = `${apiBaseUrl}/media/lesson_materials/${material.raw_content}`;
              }

              const obterExtensao = (nomeArquivo: string) => {
                if (!nomeArquivo || isLink) return "";
                const partes = nomeArquivo.split(".");
                if (partes.length > 1) {
                  return `.${partes.pop()?.toUpperCase()}`;
                }
                return "";
              };

              const extensao = obterExtensao(material.raw_content || material.file || "");

              return (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => {
                    if (urlFinal) {
                      window.open(urlFinal, "_blank");
                    } else {
                      alert("Não foi possível carregar o arquivo.");
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-[#F8F9FA] border border-gray-200 rounded-xl hover:border-[#2F52E0] hover:bg-white transition group cursor-pointer shadow-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isLink ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
                      {isLink ? <Link2 size={16} /> : <FileText size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-[#2F52E0]">
                        {material.title || "Material sem título"}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {isLink ? "Link Externo" : `Arquivo ${extensao || "PDF"}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-400 group-hover:text-[#2F52E0] pr-1 shrink-0">
                    <Download size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <LessonChallenge
        lesson={lesson}
        isCompleted={isCompleted}
        apiBaseUrl={apiBaseUrl}
        onChallengeCompleted={() => {
          setIsCompleted(true);
          lesson.completed = true;
          if (onLessonCreateOrComplete) {
            onLessonCreateOrComplete();
          }
        }}
      />

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
        {prevLesson && (
          <Link href={`/curso/${course.id}/aula/${prevLesson.id}`} className="w-full sm:flex-1">
            <button type="button" className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
              ← Anterior
            </button>
          </Link>
        )}

        {courseProgress === 100 && (
          <div className="w-full sm:flex-1 space-y-2">
            <button
              type="button"
              onClick={onEmitirCertificado}
              disabled={isGeneratingCertificate || isInstructor}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                isInstructor
                  ? "bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none"
                  : "bg-amber-500 text-white hover:bg-amber-600 active:scale-95 cursor-pointer"
              }`}
            >
              <Award className="h-4 w-4" />
              {isGeneratingCertificate ? "Emitindo Certificado..." : isInstructor ? "Certificado Indisponível (Instrutor)" : "Emitir Certificado"}
            </button>

            {(isInstructor || certificateError) && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs animate-fadeIn">
                <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                <span>
                  {certificateError || "Professores criadores não podem emitir certificados para os seus próprios cursos."}
                </span>
              </div>
            )}
          </div>
        )}

        {nextLesson && (
          <Link href={`/curso/${course.id}/aula/${nextLesson.id}`} className="w-full sm:flex-1">
            <button type="button" className="w-full py-3 px-4 rounded-xl bg-[#161B1D] text-white text-sm font-semibold hover:bg-black shadow-md cursor-pointer">
              Próxima →
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}