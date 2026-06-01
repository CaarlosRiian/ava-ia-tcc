"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  lessonTitle: string;
  lessonId: number; 
  onClose: () => void;
}

export default function AIChatPanel({ lessonTitle, lessonId, onClose }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Olá! Sou seu assistente de IA. Vi que você está assistindo a aula: ${lessonTitle}. Tem alguma dúvida sobre este conteúdo ou quer que eu resuma os pontos principais?`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput(""); 

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: userMessageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access");

      const response = await fetch(`http://localhost:8000/api/lessons/${lessonId}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMessageText }),
      });

      if (!response.ok) {
        throw new Error("Erro na resposta do servidor");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "bot",
        text: data.response, 
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem para o tutor:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          sender: "bot",
          text: "Ops, tive um problema para processar sua resposta agora. Pode tentar novamente em alguns segundos?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }; 

  return (
    <div className="w-full lg:w-[400px] border-l border-gray-100 bg-gray-50 flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-2xl">
      <div className="p-4 flex justify-between items-center border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-[#2F52E0]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#161B1D]">Tutor Inteligente</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}

            <div
              className={`p-3 rounded-2xl shadow-sm text-sm border max-w-[85%] ${
                msg.sender === "user"
                  ? "bg-[#2F52E0] text-white border-transparent rounded-tr-none"
                  : "bg-white text-gray-700 border-gray-100 rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>

            {msg.sender === "user" && (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin text-[#2F52E0]" />
              O tutor está pensando...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <form className="relative" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Aguarde o tutor responder..." : "Pergunte algo..."}
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
        <p className="text-[10px] text-center text-gray-400 mt-3 italic">
          A IA pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
}