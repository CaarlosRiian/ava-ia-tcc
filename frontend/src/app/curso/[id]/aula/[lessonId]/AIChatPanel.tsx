"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, FileText, CheckSquare, ArrowLeft, GripVertical } from "lucide-react";
import QuizView from "../../../../../components/QuizAI/QuizView";
import ChatHistory from "../../../../../components/QuizAI/ChatHistory";

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
  }, [messages, isLoading, quizQuestions]);

  const formatTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const executeAPICall = async (payload: { message: string }) => {
    const token = localStorage.getItem("access");
    if (!token) throw new Error("Usuário não autenticado.");

    const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/submit_quiz/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || "Erro na resposta do servidor");
    }

    return await response.json();
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

  const handleQuickAction = async (type: "summary" | "quiz") => {
    if (isLoading) return;

    const actionText = type === "summary" ? "📝 Gerar Resumo da Aula" : "🎯 Gerar Exercícios de Fixação";

    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), sender: "user", text: actionText, timestamp: new Date() },
    ]);
    setIsLoading(true);

    try {
      if (type === "summary") {
        const data = await executeAPICall({
          message: "Por favor, gere um resumo detalhado dos pontos principais desta aula.",
        });

        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(7), sender: "bot", text: data.response, timestamp: new Date() },
        ]);
      } else if (type === "quiz") {
        const questionsData = await fetchStructuredQuiz();
        setQuizQuestions(questionsData);
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
      setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "bot", text: data.response, timestamp: new Date() }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "bot", text: "Ops, tive um problema para processar sua resposta.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Top Header */}
        <div className="p-4 flex justify-between items-center border-b bg-white">
          <div className="flex items-center gap-2">
            {quizQuestions.length > 0 ? (
              <button onClick={() => setQuizQuestions([])} className="p-1.5 hover:bg-gray-100 rounded-lg mr-1 transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4 text-gray-500" />
              </button>
            ) : (
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            <h3 className="font-bold text-sm text-[#161B1D]">
              {quizQuestions.length > 0 ? "Exercícios de Fixação" : "Tutor de IA"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors">
            <X className="h-4 w-4 text-gray-400 hover:text-[#FF0000]" />
          </button>
        </div>

        {/* Ações Rápidas */}
        {quizQuestions.length === 0 && (
          <div className="flex gap-2 p-3 bg-white border-b border-gray-100 shadow-sm select-text">
            <button onClick={() => handleQuickAction("summary")} disabled={isLoading} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-[#2F52E0] text-xs font-semibold py-2 px-3 rounded-xl transition-all border border-blue-100 cursor-pointer">
              <FileText className="h-3.5 w-3.5" /> Gerar Resumo
            </button>
            <button onClick={() => handleQuickAction("quiz")} disabled={isLoading} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-600 text-xs font-semibold py-2 px-3 rounded-xl transition-all border border-emerald-100 cursor-pointer">
              <CheckSquare className="h-3.5 w-3.5" /> Gerar Exercícios
            </button>
          </div>
        )}

        {/* Área de Conteúdo (Chat ou Quiz) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar select-text">
          {quizQuestions.length > 0 ? (
            <QuizView
              lessonId={lessonId}
              questions={quizQuestions}
              onBackToChat={() => setQuizQuestions([])}
            />
          ) : (
            <ChatHistory messages={messages} isLoading={isLoading} formatTime={formatTime} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        {quizQuestions.length === 0 && (
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
              <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2F52E0] text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
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