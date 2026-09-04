"use client";

import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  topic?: string; // Opcional: Tópico ao qual a questão pertence
}

interface QuizViewProps {
  lessonId?: number;
  questions: Question[];
  onBackToChat: () => void;
  onQuizCompleted?: (percentage: number) => void;
}

export default function QuizView({ lessonId, questions, onBackToChat, onQuizCompleted }: QuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [strongTopics, setStrongTopics] = useState<string[]>([]);

  const handleSelectOption = (qIdx: number, option: string) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleValidateQuiz = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) return;

    setIsSubmitting(true);

    let correctCount = 0;
    const weak: string[] = [];
    const strong: string[] = [];

    // Mapeamento dos índices para o contrato do Django (question_index + selected_option)
    const formattedAnswers = Object.entries(selectedAnswers).map(([qIdxStr, option]) => {
      const idx = Number(qIdxStr);
      return {
        question_index: idx,
        selected_option: option,
      };
    });

    questions.forEach((q, idx) => {
      const selectedOption = selectedAnswers[idx];
      const isCorrect = selectedOption === q.answer;
      const topicName = q.topic || q.question;

      if (isCorrect) {
        correctCount++;
        strong.push(topicName);
      } else {
        weak.push(topicName);
      }
    });

    setScore(correctCount);
    setWeakTopics(weak);
    setStrongTopics(strong);

    const percentage = Math.round((correctCount / questions.length) * 100);

    if (!lessonId) {
      console.warn("⚠️ [QuizView] O envio foi cancelado porque 'lessonId' está indefinido/null:", lessonId);
    } else {
      try {
        const token = localStorage.getItem("access") || localStorage.getItem("token");
        
        // Garante a URL base limpa de barras e /api duplicados
        let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
        if (baseUrl.endsWith("/api")) {
          baseUrl = baseUrl.replace(/\/api$/, "");
        }

        const response = await fetch(`${baseUrl}/api/lessons/${lessonId}/submit_quiz/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            answers: formattedAnswers
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ [Backend Error]:", errorData);
        } else {
          console.log("✅ [Quiz] Desempenho salvo com sucesso no banco!");
        }
      } catch (err) {
        console.error("❌ [Network Error] Erro ao registrar quiz no servidor:", err);
      }
    }

    setIsSubmitting(false);
    setShowResults(true);

    if (onQuizCompleted) {
      onQuizCompleted(percentage);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Diagnóstico Final de Desempenho */}
      {showResults && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h4 className="font-bold text-gray-800 text-base">Diagnóstico do Quiz</h4>
            <p className="text-xs text-[#2F52E0] font-bold">
              Você acertou {score} de {questions.length} questões ({Math.round((score / questions.length) * 100)}%)
            </p>
          </div>

          {/* Feedback Pedagógico / Gatilho para Usar o Tutor */}
          {weakTopics.length > 0 ? (
            <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Oportunidade de Melhoria:</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Você teve dificuldades nas questões referentes a: <strong>{weakTopics.join(", ")}</strong>.
              </p>
              <p className="text-amber-700 text-[11px] italic">
                👉 Clique em "Voltar para o Chat" e peça ao Assistente IA para te explicar melhor esses pontos!
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs flex items-center gap-2 text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Excelente! Você demonstrou domínio em todos os tópicos deste quiz.</span>
            </div>
          )}
        </div>
      )}

      {/* Questões */}
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-gray-800 text-sm">
              Q{qIdx + 1}: {q.question}
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            {q.options.map((option, oIdx) => {
              const isSelected = selectedAnswers[qIdx] === option;
              const isCorrect = option === q.answer;

              let optionStyle = "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100";
              if (showResults) {
                if (isCorrect) optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
                else if (isSelected) optionStyle = "border-rose-500 bg-rose-50 text-rose-800";
                else optionStyle = "border-gray-100 bg-gray-50 opacity-60 text-gray-400";
              } else if (isSelected) {
                optionStyle = "border-[#2F52E0] bg-blue-50 text-[#2F52E0] font-medium";
              }

              const letras = ["A", "B", "C", "D"];
              const cleanOptionText = option.replace(/^[A-Za-z][\)\.\-]\s*/, "");

              return (
                <button
                  key={oIdx}
                  disabled={showResults}
                  onClick={() => handleSelectOption(qIdx, option)}
                  className={`w-full text-left p-3 text-xs border rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${optionStyle}`}
                >
                  <span
                    className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                      isSelected ? "bg-[#2F52E0] text-white border-transparent" : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    {letras[oIdx]}
                  </span>
                  <span>{cleanOptionText}</span>
                </button>
              );
            })}
          </div>

          {/* Explicação da Resposta Correta (Limpa, sem termos pedagógicos) */}
          {showResults && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-gray-600 leading-relaxed">
              💡 <strong>Explicação:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}

      <div className="pt-2">
        {!showResults ? (
          <button
            onClick={handleValidateQuiz}
            disabled={isSubmitting || Object.keys(selectedAnswers).length < questions.length}
            className="w-full bg-[#2F52E0] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registrando no Servidor...
              </>
            ) : (
              "Validar Respostas"
            )}
          </button>
        ) : (
          <button
            onClick={onBackToChat}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Chat
          </button>
        )}
      </div>
    </div>
  );
}