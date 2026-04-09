"use client";

import { useState } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";

interface AIChatPanelProps {
  lessonTitle: string;
  onClose: () => void;
}

export default function AIChatPanel({ lessonTitle, onClose }: AIChatPanelProps) {
  const [input, setInput] = useState("");

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
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%]">
            <p className="text-sm text-gray-700">
              Olá! Sou seu assistente de IA. Vi que você está assistindo a aula: <strong>{lessonTitle}</strong>. 
              <br/><br/>
              Tem alguma dúvida sobre este conteúdo ou quer que eu resuma os pontos principais?
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <form 
          className="relative" 
          onSubmit={(e) => { e.preventDefault(); setInput(""); }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo..."
            className="w-full pl-4 pr-12 py-3 text-gray-400 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2F52E0] transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2F52E0] text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors"
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