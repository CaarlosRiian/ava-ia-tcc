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
        const response = await fetch(`${apiBaseUrl}/lessons/${lesson?.id}/submissions/`, {
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

    if (lesson?.id) {
      fetchExistingSubmission();
    }
  }, [lesson?.id, apiBaseUrl]);

  if (!lesson?.challenge) return null;

  const handleSubmitChallenge = async () => {
    if (!studentAnswer.trim() || submittingChallenge) return;

    setSubmittingChallenge(true);
    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`${apiBaseUrl}/lessons/${lesson.id}/submissions/`, {
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
    return lesson.challenge_description || lesson.challenge || lesson.description || "Resolva o desafio proposto nesta aula escrevendo sua resposta no campo abaixo para validar seu aprendizado com a IA.";
  };

  const handleTriggerDeepen = (fullText: string) => {
    const cleanText = fullText.replace(/^[💬\s*]+/, "").replace(/\n/g, " ").trim();
    
    const promptText = `Pode detalhar melhor e me ajudar a entender este ponto: "${cleanText}"?`;

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
      <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-5 transition-all">
        
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          
          <div>
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">
              Desafio Prático da Aula
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Responda à atividade abaixo para receber feedback automático da inteligência artificial.
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-700 leading-relaxed bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
          {getChallengeDescription()}
        </div>

        {submissionResult && !isRetrying ? (
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
                <Check size={14} /> Resposta Avaliada pela IA
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl ${isScoreLow ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'}`}>
                Nota: {currentScore}/100
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Feedback Técnico:
              </p>
              
              <div className="text-xs text-gray-800 bg-orange-50/40 border border-orange-100/80 p-4 rounded-2xl leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown>{mainFeedback}</ReactMarkdown>
              </div>

              {deepenText && (
                <div
                  onClick={() => handleTriggerDeepen(deepenText)}
                  title="Clique para abrir o chat e enviar esta sugestão para a IA"
                  className="group mt-2 text-xs text-blue-900 bg-blue-50/80 hover:bg-blue-100/70 p-4 rounded-2xl leading-relaxed border border-blue-200/60 cursor-pointer transition-all duration-200 flex items-start gap-2.5 shadow-2xs"
                >
                  
                  <div className="flex-1 font-medium">
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
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw size={15} />
                  Estudar Feedback e Tentar Novamente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isRetrying && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-800 text-xs font-medium">
                <span>Modo de correção: Ajuste sua resposta com base no feedback e envie novamente.</span>
                <button 
                  type="button"
                  onClick={() => setIsRetrying(false)}
                  className="text-amber-900 underline font-bold cursor-pointer ml-2"
                >
                  Cancelar
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Sua Resposta / Código
              </label>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Cole sua solução ou descreva sua resposta técnica aqui..."
                className="w-full h-36 p-4 text-xs font-mono bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF7A00] text-gray-800 shadow-sm resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmitChallenge}
                disabled={submittingChallenge || !studentAnswer.trim()}
                className="px-6 py-3 bg-[#FF7A00] hover:bg-[#ea7306] text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={15} />
                {submittingChallenge ? "Enviando e analisando com IA..." : "Enviar Resposta para a IA"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}