"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, FileText, CheckSquare, ArrowLeft, GripVertical, Layers } from "lucide-react";
import QuizView from "../../../../../components/QuizAI/QuizView";
import ChatHistory from "../../../../../components/QuizAI/ChatHistory";
import FlashcardView from "../../../../../components/QuizAI/FlashcardView";
import { learningService } from "@/services/learningService";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date | string;
}

interface Question {
  bloom_level?: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface Flashcard {
  id: number;
  pergunta: string;
  resposta: string;
}

interface AIChatPanelProps {
  lessonTitle: string;
  lessonId: number;
  onClose: () => void;
  chatWidth: number;
  setChatWidth: (width: number) => void;
}

export default function AIChatPanel({ lessonTitle, lessonId, onClose, chatWidth, setChatWidth }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isResizingState, setIsResizingState] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined" && lessonId) {
      const saved = localStorage.getItem(`chat_history_lesson_${lessonId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar histórico:", e);
        }
      }
    }
    return [
      {
        id: "welcome",
        sender: "bot",
        text: `Olá! Sou seu assistente de IA. Vi que você está assistindo a aula: **${lessonTitle}**. Tem alguma dúvida sobre este conteúdo ou quer utilizar as ferramentas rápidas acima?`,
        timestamp: new Date(),
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined" && lessonId) {
      const saved = localStorage.getItem(`chat_history_lesson_${lessonId}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: `Olá! Sou seu assistente de IA. Vi que você está assistindo a aula: **${lessonTitle}**. Tem alguma dúvida sobre este conteúdo ou quer utilizar as ferramentas rápidas acima?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [lessonId, lessonTitle]);

  useEffect(() => {
    if (lessonId && messages.length > 0) {
      localStorage.setItem(`chat_history_lesson_${lessonId}`, JSON.stringify(messages));
    }
  }, [messages, lessonId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 300 && newWidth <= 800) {
      setChatWidth(newWidth);
    }
  };

  const stopResizing = () => {
    isResizingRef.current = false;
    setIsResizingState(false);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResizing);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    setIsResizingState(true);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, quizQuestions, generatedFlashcards, summaryText]);

  const formatTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-gray-900">{part}</strong>;
      }
      return part;
    });
  };

  const executeAPICall = async (payload: { message: string }) => {
    const token = localStorage.getItem("access");
    if (!token) throw new Error("Usuário não autenticado.");

    const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = {};
      }
      throw new Error(errorData.error || errorData.detail || "Erro na resposta do servidor");
    }

    try {
      return responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error("[DEBUG] Erro ao fazer parse do JSON:", e);
      return { response: responseText };
    }
  };

  const fetchStructuredQuiz = async () => {
    const token = localStorage.getItem("access");
    const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/get_quiz/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro ao buscar JSON do Quiz");

    const data = await response.json();
    if (data && data.quiz && Array.isArray(data.quiz.questions)) {
      return data.quiz.questions;
    }
    return data.questions || data.quiz || [];
  };

  const fetchSummary = async () => {
    const token = localStorage.getItem("access");
    const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/get_summary/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      return data.summary || data.response || data.text;
    }

    const fallbackData = await executeAPICall({
      message: "Por favor, gere um resumo estruturado e detalhado dos pontos principais desta aula.",
    });
    return fallbackData.response || fallbackData.message || fallbackData.text || JSON.stringify(fallbackData);
  };

  const handleAnswerCard = async (cardId: number, feedback: 'errei' | 'medio' | 'facil') => {
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Usuário não autenticado.");

      await fetch(`http://localhost:8000/api/flashcards/${cardId}/responder/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
      });
    } catch (error) {
      console.error("Erro de rede ao enviar feedback do flashcard:", error);
    }
  };

  const handleQuickAction = async (type: "summary" | "quiz" | "flashcards") => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (type === "summary") {
        const text = await fetchSummary();
        setSummaryText(text);
      } else if (type === "quiz") {
        const questionsData = await fetchStructuredQuiz();
        setQuizQuestions(questionsData);
      } else if (type === "flashcards") {
        const data = await learningService.generateFlashcards(lessonId);
        const cards = Array.isArray(data) ? data : data.flashcards;
        setGeneratedFlashcards(cards);
      }
    } catch (error: any) {
      console.error("Erro na ação rápida:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          sender: "bot",
          text: "Não consegui processar a requisição de IA agora. Verifique a conexão com o servidor.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "user", text: userMessageText, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const data = await executeAPICall({ message: userMessageText });
      const botReply = data.response || data.message || data.text || (typeof data === 'string' ? data : JSON.stringify(data));

      setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "bot", text: botReply, timestamp: new Date() }]);
    } catch (error) {
      console.error("[DEBUG] Erro capturado no catch do chat:", error);
      setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "bot", text: "Ops, tive um problema para processar sua resposta.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isCustomView = quizQuestions.length > 0 || generatedFlashcards.length > 0 || summaryText !== null;

  return (
    <>
      {isResizingState && <div className="fixed inset-0 z-[9999] cursor-ew-resize select-none" />}

      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200" />

      <div
        style={{ width: `${chatWidth}px` }}
        className="
          fixed inset-y-0 right-0 w-full z-50 flex flex-col bg-gray-50 shadow-2xl animate-in slide-in-from-bottom duration-300
          lg:relative lg:inset-auto lg:z-auto lg:flex lg:h-full lg:max-w-none lg:border-l lg:border-gray-200 lg:animate-in lg:slide-in-from-right lg:shrink-0
          select-none
        "
      >
        <div
          onMouseDown={startResizing}
          title="Clique e arraste para redimensionar"
          className="hidden lg:flex absolute -left-4 top-0 w-8 h-full cursor-ew-resize items-center justify-center z-[100] group"
        >
          <div className="w-1 h-full bg-gray-200 group-hover:bg-[#2F52E0] group-active:bg-[#2F52E0] transition-colors" />

          <div className="absolute top-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-md rounded-md p-1 group-hover:border-[#2F52E0] group-hover:scale-110 transition-all cursor-ew-resize">
            <GripVertical className="h-4 w-4 text-gray-600 group-hover:text-[#2F52E0]" />
          </div>
        </div>

        <div className="p-4 flex justify-between items-center border-b bg-white">
          <div className="flex items-center gap-2">
            {isCustomView ? (
              <button
                onClick={() => {
                  setQuizQuestions([]);
                  setGeneratedFlashcards([]);
                  setSummaryText(null);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg mr-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-gray-500" />
              </button>
            ) : (
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            <h3 className="font-bold text-sm text-[#161B1D]">
              {quizQuestions.length > 0
                ? "Exercícios de Fixação"
                : generatedFlashcards.length > 0
                  ? "Flashcards de Estudo"
                  : summaryText !== null
                    ? "Resumo da Aula"
                    : "Tutor de IA"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors">
            <X className="h-4 w-4 text-gray-400 hover:text-[#FF0000]" />
          </button>
        </div>

        {!isCustomView && (
          <div className="flex gap-1.5 p-3 bg-white border-b border-gray-100 shadow-sm select-text">
            <button
              onClick={() => handleQuickAction("summary")}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-[#2F52E0] text-[11px] font-semibold py-2 px-2 rounded-xl transition-all border border-blue-100 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" /> Resumo
            </button>
            <button
              onClick={() => handleQuickAction("quiz")}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-600 text-[11px] font-semibold py-2 px-2 rounded-xl transition-all border border-emerald-100 cursor-pointer"
            >
              <CheckSquare className="h-3.5 w-3.5" /> Exercícios
            </button>
            <button
              onClick={() => handleQuickAction("flashcards")}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-600 text-[11px] font-semibold py-2 px-2 rounded-xl transition-all border border-purple-100 cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5" /> Flashcards
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar select-text">
          {quizQuestions.length > 0 ? (
            <QuizView
              lessonId={lessonId}
              questions={quizQuestions}
              onBackToChat={() => setQuizQuestions([])}
            />
          ) : generatedFlashcards.length > 0 ? (
            <FlashcardView
              flashcards={generatedFlashcards}
              onBackToChat={() => setGeneratedFlashcards([])}
              onAnswerCard={handleAnswerCard}
            />
          ) : summaryText !== null ? (
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                {renderFormattedText(summaryText)}
              </div>
              <button
                onClick={() => setSummaryText(null)}
                className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Voltar para o Chat
              </button>
            </div>
          ) : (
            <ChatHistory messages={messages} isLoading={isLoading} formatTime={formatTime} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {!isCustomView && (
          <div className="p-4 bg-white border-t">
            <form className="relative" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={isLoading ? "O tutor está pensando..." : "Faça uma pergunta sobre o conteúdo..."}
                className="w-full pl-4 pr-12 py-3 text-gray-800 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2F52E0] transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2F52E0] text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="text-[10px] text-center text-gray-400 mt-3 italic">A IA pode cometer erros.</p>
          </div>
        )}
      </div>
    </>
  );
}