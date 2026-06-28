"use client";

import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizViewProps {
  questions: Question[];
  onBackToChat: () => void;
}

export default function QuizView({ questions, onBackToChat }: QuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qIdx: number, option: string) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h4 className="font-bold text-gray-800 text-sm">
            Q{qIdx + 1}: {q.question}
          </h4>
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

              return (
                <button
                  key={oIdx}
                  disabled={showResults}
                  onClick={() => handleSelectOption(qIdx, option)}
                  className={`w-full text-left p-3 text-xs border rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${optionStyle}`}
                >
                  <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                    isSelected ? "bg-[#2F52E0] text-white border-transparent" : "bg-white border-gray-300 text-gray-500"
                  }`}>
                    {letras[oIdx]}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
          {showResults && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-gray-500 leading-relaxed italic">
              💡 <strong>Explicação:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}

      <div className="pt-2">
        {!showResults ? (
          <button
            onClick={() => setShowResults(true)}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            className="w-full bg-[#2F52E0] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
          >
            Validar Respostas
          </button>
        ) : (
          <button
            onClick={onBackToChat}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            Voltar para o Chat
          </button>
        )}
      </div>
    </div>
  );
}