"use client";

import { Sparkles, FileText, CheckSquare, Layers } from "lucide-react";

interface LessonLearningToolsProps {
  lessonTitle: string;
  setAiOpen: (open: boolean) => void;
}

export default function LessonLearningTools({ lessonTitle, setAiOpen }: LessonLearningToolsProps) {
  const prefill = (prompt: string) =>
    window.dispatchEvent(new CustomEvent("prefill-and-open-chat", { detail: { prompt } }));

  const tools = [
    {
      icon: FileText,
      title: "Resumo da aula",
      description: "Os pontos principais do conteúdo em poucas linhas.",
      color: "bg-orange-50 text-[#2F52E0]",
      onClick: () => prefill(`Faça um resumo estruturado dos pontos principais da aula "${lessonTitle}".`),
    },
    {
      icon: CheckSquare,
      title: "Exercícios de fixação",
      description: "Perguntas para testar o que você aprendeu.",
      color: "bg-emerald-50 text-emerald-600",
      onClick: () => prefill(`Crie exercícios de fixação sobre a aula "${lessonTitle}".`),
    },
    {
      icon: Layers,
      title: "Flashcards",
      description: "Cartões de estudo para revisar com repetição.",
      color: "bg-purple-50 text-purple-600",
      onClick: () => prefill(`Crie flashcards de estudo sobre a aula "${lessonTitle}".`),
    },
    {
      icon: Sparkles,
      title: "Tirar dúvidas com a IA",
      description: "Abra o assistente e pergunte o que quiser.",
      color: "bg-orange-50 text-[#FF7A00]",
      onClick: () => setAiOpen(true),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tools.map(({ icon: Icon, title, description, color, onClick }) => (
        <button
          key={title}
          type="button"
          onClick={onClick}
          className="flex items-start gap-3 p-4 text-left bg-[#F8F9FA] border border-gray-200 rounded-xl hover:border-[#2F52E0] hover:bg-white transition shadow-sm cursor-pointer"
        >
          <div className={`p-2 rounded-lg shrink-0 ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}