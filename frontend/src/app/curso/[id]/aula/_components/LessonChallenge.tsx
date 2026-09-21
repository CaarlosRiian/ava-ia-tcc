"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, Check, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface LessonChallengeProps {
  lesson: any;
  isCompleted: boolean;
  apiBaseUrl: string;
  onChallengeCompleted?: () => void; 
}

export default function LessonChallenge({ lesson, isCompleted, apiBaseUrl, onChallengeCompleted }: LessonChallengeProps) {
  const [studentAnswer, setStudentAnswer] = useState("");
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const fetchExistingSubmission = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(`${apiBaseUrl}/lessons/${lesson.id}/submit/`, {
          method: "GET",
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.feedback) {
            setSubmissionResult(data);
            if (data.answer_text) {
              setStudentAnswer(data.answer_text);
            }
          }
        }
      } catch (e) {
      }
    };

    if (lesson?.id && isCompleted) {
      fetchExistingSubmission();
    }
  }, [lesson?.id, isCompleted, apiBaseUrl]);

  const handleSubmitChallenge = async () => {
    if (!studentAnswer.trim() || submittingChallenge) return;

    setSubmittingChallenge(true);
    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`${apiBaseUrl}/lessons/${lesson.id}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ answer_text: studentAnswer })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || "Erro ao enviar a resposta do desafio.");
      }

      const data = await response.json();
      setSubmissionResult(data);
      setIsRetrying(false);

      if (onChallengeCompleted) {
        onChallengeCompleted();
      }
    } catch (err: any) {
      console.error("Erro no envio:", err);
      alert(err.message || "Não foi possível enviar o desafio.");
    } finally {
      setSubmittingChallenge(false);
    }
  };

  const getChallengeDescription = () => {
    if (typeof lesson.challenge === "object" && lesson.challenge !== null) {
      return lesson.challenge.description || lesson.challenge.title || JSON.stringify(lesson.challenge);
    }
    return lesson.challenge_description || lesson.challenge || lesson.description || "Resolva o desafio proposto nesta aula escrevendo seu código ou resposta no campo abaixo para validar seu aprendizado com a IA.";
  };

  if (!isCompleted) return null;

  const handleTriggerDeepen = (fullText: string) => {
    const match = fullText.match(/`([^`]+)`/);
    const promptText = match ? match[1] : fullText.replace(/^[💬\s*]+/, "").trim();

    window.dispatchEvent(
      new CustomEvent("prefill-and-open-chat", { detail: { prompt: promptText } })
    );
  };

  const rawFeedback = submissionResult?.feedback || "";
  const parts = rawFeedback.split("💬");
  const mainFeedback = parts[0] || rawFeedback;
  const deepenText = parts[1] ? `💬 ${parts[1]}` : null;

  const currentScore = submissionResult ? Number(submissionResult.score ?? 100) : 0;
  const isScoreLow = currentScore < 70;

  return (
    <div className="mb-8 pt-6 border-t border-gray-100">
      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-[#2F52E0]" /> Desafio Prático da Aula
          </h3>
          <span className="text-[11px] font-medium px-2.5 py-1 bg-blue-50 text-[#2F52E0] rounded-full border border-blue-100">
            Correção Automática por IA
          </span>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          {getChallengeDescription()}
        </p>

        {submissionResult && !isRetrying ? (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Resposta Enviada e Avaliada!
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isScoreLow ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                Nota: {currentScore}%
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                Feedback da IA:
              </p>
              
              <div className="text-xs text-blue-900 bg-blue-50/60 p-3 rounded-lg leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown>{mainFeedback}</ReactMarkdown>
              </div>

              {deepenText && (
                <div
                  onClick={() => handleTriggerDeepen(deepenText)}
                  title="Clique para abrir o chat e enviar esta sugestão para a IA"
                  className="group mt-2 text-xs text-blue-800 bg-blue-100/70 hover:bg-blue-200/80 p-3 rounded-lg leading-relaxed border border-blue-200 cursor-pointer transition-all duration-200 flex items-start gap-2 shadow-xs"
                >
                  <Sparkles size={14} className="text-[#2F52E0] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 font-medium group-hover:font-bold transition-all">
                    <ReactMarkdown>{deepenText}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {isScoreLow && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsRetrying(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  Estudar Feedback e Tentar Novamente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {isRetrying && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-800 text-xs font-medium">
                <span>Modo de correção: Ajuste sua resposta com base no feedback da IA e envie novamente.</span>
                <button 
                  type="button"
                  onClick={() => setIsRetrying(false)}
                  className="text-amber-900 underline font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}

            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Cole sua solução ou código aqui..."
              className="w-full h-32 p-3 text-xs font-mono bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F52E0] text-zinc-800 shadow-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmitChallenge}
                disabled={submittingChallenge || !studentAnswer.trim()}
                className="px-5 py-2.5 bg-[#2F52E0] text-white rounded-xl font-bold text-xs shadow-md hover:opacity-90 transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {submittingChallenge ? "Enviando e analisando..." : "Enviar Resposta para a IA"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}