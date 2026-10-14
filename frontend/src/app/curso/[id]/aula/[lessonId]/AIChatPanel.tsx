"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, FileText, CheckSquare, ArrowLeft } from "lucide-react";
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
}

const welcomeMessage = (lessonTitle: string): Message => ({
  id: "welcome",
  sender: "bot",
  text: `Olá! Sou seu assistente de IA. Vi que você está assistindo a aula: **${lessonTitle}**. Tem alguma dúvida sobre este conteúdo ou quer utilizar as ferramentas rápidas acima?`,
  timestamp: new Date(),
});

export default function AIChatPanel({ lessonTitle, lessonId }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [summaryText, setSummaryText] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    return [welcomeMessage(lessonTitle)];
  });

  const sendPromptDirectly = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setQuizQuestions([]);
    setSummaryText(null);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), sender: "user", text: trimmed, timestamp: new Date() },
    ]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Usuário não autenticado.");

      const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
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

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        data = { response: responseText };
      }

      const botReply = data.response || data.message || data.text || (typeof data === "string" ? data : JSON.stringify(data));

      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(7), sender: "bot", text: botReply, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("[DEBUG] Erro capturado no chat:", error);
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(7), sender: "bot", text: "Ops, tive um problema para processar sua resposta.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, isLoading]);

  useEffect(() => {
    const pendingPrompt = localStorage.getItem("pending_chat_prompt");
    if (pendingPrompt) {
      localStorage.removeItem("pending_chat_prompt");
      if (pendingPrompt.includes("exercícios de fixação") || pendingPrompt.includes("múltipla escolha")) {
        handleQuickAction("quiz");
      } else {
        sendPromptDirectly(pendingPrompt);
      }
    }
  }, [sendPromptDirectly]);

  useEffect(() => {
    const handlePrefillAndOpen = (event: any) => {
      const promptToFill = event.detail?.prompt;
      if (promptToFill) {
        if (promptToFill.includes("exercícios de fixação") || promptToFill.includes("múltipla escolha")) {
          handleQuickAction("quiz");
        } else {
          sendPromptDirectly(promptToFill);
        }
      }
    };

    window.addEventListener("prefill-and-open-chat", handlePrefillAndOpen);
    window.addEventListener("send-ai-prompt" as any, handlePrefillAndOpen);
    return () => {
      window.removeEventListener("prefill-and-open-chat", handlePrefillAndOpen);
      window.removeEventListener("send-ai-prompt" as any, handlePrefillAndOpen);
    };
  }, [sendPromptDirectly]);

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
      setMessages([welcomeMessage(lessonTitle)]);
    }
  }, [lessonId, lessonTitle]);

  useEffect(() => {
    if (lessonId && messages.length > 0) {
      localStorage.setItem(`chat_history_lesson_${lessonId}`, JSON.stringify(messages));
    }
  }, [messages, lessonId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading, quizQuestions, summaryText]);

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

  const fetchStructuredQuiz = async (forceRefresh = false) => {
    const token = localStorage.getItem("access");
    const url = forceRefresh
      ? `http://localhost:8000/api/lessons/${lessonId}/get_quiz/?refresh=true`
      : `http://localhost:8000/api/lessons/${lessonId}/get_quiz/`;

    const response = await fetch(url, {
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

    const tokenHeader = localStorage.getItem("access");
    const fallbackRes = await fetch(`http://localhost:8000/api/lessons/${lessonId}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenHeader}`,
      },
      body: JSON.stringify({ message: "Por favor, gere um resumo estruturado e detalhado dos pontos principais desta aula." }),
    });
    const fallbackData = await fallbackRes.json();
    return fallbackData.response || fallbackData.message || fallbackData.text || JSON.stringify(fallbackData);
  };

  const handleQuickAction = async (type: "summary" | "quiz") => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (type === "summary") {
        const text = await fetchSummary();
        setSummaryText(text);
      } else if (type === "quiz") {
        const questionsData = await fetchStructuredQuiz(true);
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
    await sendPromptDirectly(input);
  };

  const resetCustomView = () => {
    setQuizQuestions([]);
    setSummaryText(null);
  };

  const isCustomView = quizQuestions.length > 0 || summaryText !== null;

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      {isCustomView ? (
        <div className="px-4 py-3 flex items-center gap-2 border-b bg-white shrink-0">
          <button
            onClick={resetCustomView}
            aria-label="Voltar para o chat"
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </button>
          <h3 className="font-bold text-sm text-[#161B1D]">
            {quizQuestions.length > 0 ? "Exercícios de Fixação" : "Resumo da Aula"}
          </h3>
        </div>
      ) : (
        <div className="flex gap-2 p-3 bg-white border-b border-gray-100 shadow-sm shrink-0">
          <button
            onClick={() => handleQuickAction("summary")}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-[#2F52E0] text-xs font-semibold py-2 px-3 rounded-xl transition-all border border-blue-100 cursor-pointer"
          >
            <FileText className="h-4 w-4" /> Resumo
          </button>
          <button
            onClick={() => handleQuickAction("quiz")}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-600 text-xs font-semibold py-2 px-3 rounded-xl transition-all border border-emerald-100 cursor-pointer"
          >
            <CheckSquare className="h-4 w-4" /> Exercícios
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {quizQuestions.length > 0 ? (
          <QuizView
            lessonId={lessonId}
            questions={quizQuestions}
            onBackToChat={() => setQuizQuestions([])}
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
        <div className="p-4 bg-white border-t shrink-0">
          <form className="relative flex items-end gap-2" onSubmit={handleSendMessage}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={isLoading}
              rows={1}
              placeholder={isLoading ? "O tutor está pensando..." : "Faça uma pergunta... (Enter para enviar)"}
              className="w-full pl-4 pr-12 py-3 text-gray-800 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2F52E0] transition-all disabled:opacity-50 resize-none max-h-[120px] min-h-[46px] overflow-y-auto custom-scrollbar"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Enviar mensagem"
              className="absolute right-2 bottom-2.5 p-2 bg-[#2F52E0] text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3 italic">A IA pode cometer erros.</p>
        </div>
      )}
    </div>
  );
}