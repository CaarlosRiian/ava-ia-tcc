"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowUpDown } from "lucide-react";

interface Submission {
  id: string;
  student_name?: string;
  student_email?: string;
  student_answer?: string;
  answer_text?: string;
  ai_feedback?: string;
  feedback?: string;
  improvements?: string;   
  ai_analysis?: string;
  grade?: number | string;
  created_at?: string;
}

interface LessonSubmissionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  lessonTitle: string;
}

const formatStudentName = (name?: string, fallbackIndex?: number) => {
  if (!name) return `Usuário #${(fallbackIndex ?? 0) + 1}`;
  return name.replace(/_/g, " ");
};

const renderFormattedFeedback = (text: string) => {
  if (!text) return "Nenhum feedback gerado.";

  return text.split("\n").map((line, lineIdx) => {
    let cleanLine = line.trim();
    if (!cleanLine) return null;

    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

    return (
      <p key={lineIdx} className="mb-1.5 last:mb-0 leading-relaxed">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const boldText = part.slice(2, -2);
            return (
              <strong key={partIdx} className="font-semibold text-zinc-900">
                {boldText}{" "}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  });
};

export const LessonSubmissionsModal = ({
  isOpen,
  onOpenChange,
  lessonId,
  lessonTitle,
}: LessonSubmissionsModalProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); 

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
      
      let listData = [];
      if (Array.isArray(data)) {
        listData = data;
      } else if (data.results && Array.isArray(data.results)) {
        listData = data.results;
      } else if (data && typeof data === 'object') {
        listData = [data];
      }

      setSubmissions(listData);
    } catch (err: any) {
      console.error("Erro ao buscar submissões:", err);
      setError("Não foi possível buscar as submissões dos alunos. Verifique se você está logado.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  const sortedSubmissions = [...submissions].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (sortOrder === "asc") {
      return dateA - dateB;
    } else {
      return dateB - dateA; 
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Submissões da Atividade</DialogTitle>
          <DialogDescription className="truncate">
            Aula: <span className="font-semibold text-zinc-700">{lessonTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {!loading && !error && submissions.length > 0 && (
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2 text-xs">
            <span className="text-zinc-400">
              Total: <strong className="text-zinc-700">{submissions.length}</strong> envio(s)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="h-7 text-xs text-zinc-600 hover:text-zinc-900 gap-1.5 cursor-pointer"
            >
              <ArrowUpDown size={13} />
              {sortOrder === "desc" ? "Mais recentes primeiro" : "Mais antigos primeiro"}
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-xs">Carregando respostas...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs italic border border-dashed border-zinc-200 rounded-2xl">
              Nenhum envio encontrado para esta atividade ainda.
            </div>
          ) : (
            sortedSubmissions.map((sub, idx) => {
              const feedbackRaw = sub.ai_feedback || sub.feedback || sub.improvements || sub.ai_analysis || "";

              return (
                <div
                  key={sub.id || idx}
                  className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                    <div>
                      <p className="font-semibold text-zinc-800 text-sm">
                        {formatStudentName(sub.student_name, idx)}
                      </p>
                      <p className="text-[11px] text-zinc-400">{sub.student_email || ""}</p>
                    </div>
                    {sub.created_at && (
                      <span className="text-[10px] text-zinc-400">
                        {(() => {
                          try {
                            const dateObj = new Date(sub.created_at);
                            return isNaN(dateObj.getTime()) ? sub.created_at : dateObj.toLocaleString();
                          } catch (e) {
                            return sub.created_at;
                          }
                        })()}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-bold uppercase text-[11px] tracking-wider mb-1">
                      Resposta do Aluno:
                    </p>
                    <p className="bg-white p-2.5 rounded-xl border border-zinc-200 text-zinc-700 whitespace-pre-wrap font-mono">
                      {sub.student_answer || sub.answer_text || "Nenhuma resposta informada."}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold  uppercase text-[11px] tracking-wider mb-1 flex items-center gap-1">
                       Feedback Automático:
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-gray text-zinc-800">
                      {renderFormattedFeedback(feedbackRaw)}
                    </div>
                  </div>
                </div>
              );
            })
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