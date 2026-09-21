"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Layers, ArrowLeft, CheckCircle2 } from "lucide-react";

interface Flashcard {
  id: number;
  pergunta?: string;
  resposta?: string;
  front?: string;
  back?: string;
  back_main?: string;
}

interface FlashcardViewProps {
  flashcards: Flashcard[];
  onBackToChat: () => void;
  onAnswerCard?: (cardId: number, feedback: 'errei' | 'medio' | 'facil') => void;
}

export default function FlashcardView({ flashcards, onBackToChat, onAnswerCard }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    console.group("[FlashcardView] Dados carregados");
    console.groupEnd();
  }, [flashcards, onAnswerCard]);

  if (!flashcards || flashcards.length === 0) {
    console.warn("[FlashcardView] Nenhum flashcard foi fornecido para exibição.");
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-sm text-gray-500 mb-4">Nenhum flashcard disponível.</p>
        <button
          onClick={() => {
            console.log("[FlashcardView] Clique em 'Voltar ao Chat' (Lista Vazia)");
            onBackToChat();
          }}
          className="text-xs text-[#2F52E0] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Chat
        </button>
      </div>
    );
  }

  if (isCompleted) {
    console.log("[FlashcardView] Todos os cards foram concluídos!");
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Sessão Concluída!</h3>
          <p className="text-xs text-gray-500 mt-1">
            Seus feedbacks foram salvos e o algoritmo reagendou a revisão destes cards.
          </p>
        </div>
        <button
          onClick={() => {
            console.log("[FlashcardView] Clique em 'Voltar para o Chat' (Tela Final)");
            onBackToChat();
          }}
          className="w-full py-2.5 bg-[#2F52E0] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          Voltar para o Chat
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const questionText = currentCard?.pergunta || currentCard?.front || "";
  const answerText = currentCard?.resposta || currentCard?.back || currentCard?.back_main || "";

  const handleFeedback = (feedback: 'errei' | 'medio' | 'facil') => {
    console.group(`[FlashcardView] Feedback Selecionado: "${feedback.toUpperCase()}"`);

    if (onAnswerCard && currentCard?.id) {
      onAnswerCard(currentCard.id, feedback);
    } else {
      console.error("AENÇÃO: Prop 'onAnswerCard' não foi fornecida pelo componente pai ou card.id é inválido!", {
        hasCallback: Boolean(onAnswerCard),
        cardId: currentCard?.id,
      });
    }
    console.groupEnd();

    setShowAnswer(false);
    
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const toggleShowAnswer = () => {
    const nextState = !showAnswer;
    console.log(`[FlashcardView] Card virado. Exibindo: ${nextState ? "RESPOSTA" : "PERGUNTA"}`);
    setShowAnswer(nextState);
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium border-b border-gray-100 pb-2">
        <span className="flex items-center gap-1 text-[#2F52E0]">
          <Layers className="w-3.5 h-3.5" /> Card {currentIndex + 1} de {flashcards.length}
        </span>
        <span>Revisão Rápida</span>
      </div>

      <div
        onClick={toggleShowAnswer}
        className="min-h-[220px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between items-center text-center relative select-none"
      >
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          {showAnswer ? "Resposta" : "Pergunta"}
        </span>

        <p className="text-sm font-semibold text-gray-800 leading-relaxed my-auto">
          {showAnswer ? answerText : questionText}
        </p>

        {!showAnswer && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
             Clique para revelar
          </span>
        )}
      </div>

      <div className="space-y-2">
        {showAnswer ? (
          <div className="space-y-2">
            <p className="text-[11px] text-center text-gray-500 font-medium">
              Como foi lembrar desse conteúdo? Define o tempo da próxima revisão:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleFeedback('errei')}
                className="flex-1 py-2 px-1 bg-red-600 hover:bg-red-700 text-white rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-xs font-bold">Errei</span>
                <span className="text-[10px] text-red-100 font-normal">Rever amanhã</span>
              </button>

              <button
                onClick={() => handleFeedback('medio')}
                className="flex-1 py-2 px-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-xs font-bold">Médio</span>
                <span className="text-[10px] text-amber-100 font-normal">Rever em 3d</span>
              </button>

              <button
                onClick={() => handleFeedback('facil')}
                className="flex-1 py-2 px-1 bg-green-600 hover:bg-green-700 text-white rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-xs font-bold">Fácil</span>
                <span className="text-[10px] text-green-100 font-normal">Rever em 7d</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log("⬅[FlashcardView]: Voltou para o card anterior");
                setShowAnswer(false);
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentIndex === 0}
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Anterior
            </button>
            <button
              onClick={() => {
                console.log("[FlashcardView]: Revelou a resposta via botão");
                setShowAnswer(true);
              }}
              className="flex-1 py-2 px-3 bg-[#2F52E0] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Revelar Resposta
            </button>
          </div>
        )}

        <button
          onClick={() => {
            console.log("[FlashcardView] Clique em 'Voltar para a conversa'");
            onBackToChat();
          }}
          className="w-full py-2 text-center text-xs text-gray-500 hover:text-gray-800 font-medium transition cursor-pointer"
        >
          Voltar para a conversa
        </button>
      </div>
    </div>
  );
}