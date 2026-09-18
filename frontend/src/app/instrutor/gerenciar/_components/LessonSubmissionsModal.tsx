"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Submission {
  id: string;
  student_name?: string;
  student_email?: string;
  student_answer: string;
  ai_feedback: string;
  grade?: number | string;
  created_at?: string;
}

interface LessonSubmissionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  lessonTitle: string;
}

export const LessonSubmissionsModal = ({
  isOpen,
  onOpenChange,
  lessonId,
  lessonTitle,
}: LessonSubmissionsModalProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && lessonId) {
      fetchSubmissions();
    }
  }, [isOpen, lessonId]);

  async function fetchSubmissions() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("access") ||
        localStorage.getItem("token") || "";

      const url = `http://127.0.0.1:8000/api/lessons/${lessonId}/submissions/`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      setSubmissions(data.results || data);
    } catch (err: any) {
      console.error("Erro ao buscar submissões:", err);
      setError("Não foi possível buscar as submissões dos alunos. Verifique se você está logado como professor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Submissões da Atividade</DialogTitle>
          <DialogDescription className="truncate">
            Aula: <span className="font-semibold text-zinc-700">{lessonTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-xs">Carregando respostas dos alunos...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs italic border border-dashed border-zinc-200 rounded-2xl">
              Nenhum aluno enviou uma resposta para esta atividade ainda.
            </div>
          ) : (
            submissions.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">
                      {sub.student_name || `Aluno #${idx + 1}`}
                    </p>
                    <p className="text-[11px] text-zinc-400">{sub.student_email || ""}</p>
                  </div>
                  {sub.created_at && (
                    <span className="text-[10px] text-zinc-400">
                      {(() => {
                        try {
                          const dateObj = new Date(sub.created_at);
                          return isNaN(dateObj.getTime()) ? sub.created_at : dateObj.toLocaleDateString();
                        } catch (e) {
                          return sub.created_at;
                        }
                      })()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider mb-1">
                    Resposta do Aluno:
                  </p>
                  <p className="bg-white p-2.5 rounded-xl border border-zinc-200 text-zinc-700 whitespace-pre-wrap">
                    {sub.student_answer}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-600 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Feedback Automático da IA:
                  </p>
                  <p className=" p-2.5 rounded-xl border border-gray-400 text-900 whitespace-pre-wrap">
                    {sub.ai_feedback}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end border-t border-zinc-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs h-9"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};