"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, FileText, CheckSquare, ArrowLeft } from "lucide-react";
import QuizView from "../../../../../components/QuizAI/QuizView";
import ChatHistory from "../../../../../components/QuizAI/ChatHistory";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date | string; 
}

interface Question {
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Olá! Sou seu assistente de IA. Vi que você está assistindo a aula: **${lessonTitle}**. Tem alguma dúvida sobre este conteúdo ou quer utilizar as ferramentas rápidas acima?`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 320 && newWidth <= 700) setChatWidth(newWidth);
  };

  const stopResizing = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
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

  const executeAPICall = async (payload: { message?: string; action_type?: "summary" | "quiz" }) => {
    const token = localStorage.getItem("access");
    const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro na resposta do servidor");
    return await response.json();
  };

  const fetchStructuredQuiz = async () => {
    const token = localStorage.getItem("access");
    const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/get_quiz/`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erro ao buscar JSON do Quiz");
    
    const data = await response.json();
    
    if (data && data.quiz && Array.isArray(data.quiz.questions)) {
      return data.quiz.questions;
    }
    
    return data.questions || [];
  };

  const handleQuickAction = async (type: "summary" | "quiz") => {
    if (isLoading) return;

    const actionText = type === "summary" ? "📝 Gerar Resumo da Aula" : "🎯 Gerar Exercícios de Fixação";
    setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "user", text: actionText, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      await executeAPICall({ action_type: type });

      if (type === "summary") {
        const data = await executeAPICall({ action_type: "summary" });
        setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "bot", text: data.response, timestamp: new Date() }]);
      } else if (type === "quiz") {
        const questionsData = await fetchStructuredQuiz();
        setQuizQuestions(questionsData);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(7), sender: "bot", text: "Não consegui processar a requisição de IA agora.", timestamp: new Date() }]);
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
    <div style={{ width: `${chatWidth}px` }} className="relative hidden lg:flex border-l border-gray-100 bg-gray-50 flex-col h-full animate-in slide-in-from-right duration-300 shadow-2xl shrink-0 select-none">
      <div onMouseDown={startResizing} className="absolute left-0 top-0 w-2 h-full cursor-ew-resize hover:bg-[#2F52E0]/30 active:bg-[#2F52E0]/50 transition-colors z-50" />

      <div className="p-4 flex justify-between items-center border-b bg-white">
        <div className="flex items-center gap-2">
          {quizQuestions.length > 0 ? (
            <button onClick={() => setQuizQuestions([])} className="p-1.5 hover:bg-gray-100 rounded-lg mr-1 transition-colors cursor-pointer">
              <ArrowLeft className="h-4 w-4 text-gray-500" />
            </button>
          ) : (
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Sparkles className="h-4 w-4 text-[#2F52E0]" />
            </div>
          )}
          <h3 className="font-bold text-sm text-[#161B1D]">
            {quizQuestions.length > 0 ? "Exercícios de Fixação" : "Tutor Inteligente"}
          </h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar select-text">
        {quizQuestions.length > 0 ? (
          <QuizView questions={quizQuestions} onBackToChat={() => setQuizQuestions([])} />
        ) : (
          <ChatHistory messages={messages} isLoading={isLoading} formatTime={formatTime} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {quizQuestions.length === 0 && (
        <div className="p-4 bg-white border-t">
          <form className="relative" onSubmit={handleSendMessage}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} placeholder={isLoading ? "Aguarde o tutor responder..." : "Pergunte algo..."} className="w-full pl-4 pr-12 py-3 text-gray-800 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2F52E0] transition-all disabled:opacity-50" />
            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2F52E0] text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3 italic">A IA pode cometer erros. Verifique informações importantes.</p>
        </div>
      )}
    </div>
  );
}