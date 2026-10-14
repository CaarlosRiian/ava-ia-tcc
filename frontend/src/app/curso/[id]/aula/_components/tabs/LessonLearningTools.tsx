"use client";

import { Brain, FileText, CheckSquare, Sparkles } from "lucide-react";

interface LessonLearningToolsProps {
  lessonTitle: string;
  setAiOpen: (open: boolean) => void;
}

export default function LessonLearningTools({ lessonTitle, setAiOpen }: LessonLearningToolsProps) {
  const sendAuto = (prompt: string) => {
    localStorage.setItem("pending_ai_prompt", prompt);

    setAiOpen(true);

    window.dispatchEvent(new CustomEvent("send-ai-prompt", { detail: { prompt } }));
  };

  const tools = [
    {
      icon: FileText,
      title: "Resumo da aula",
      description: "Os pontos principais do conteúdo em poucas linhas.",
      color: "bg-orange-50 text-[#2F52E0]",
      onClick: () => sendAuto(`Faça um resumo estruturado dos pontos principais da aula "${lessonTitle}".`),
    },
    {
      icon: CheckSquare,
      title: "Exercícios de fixação",
      description: "Perguntas de múltipla escolha para testar o que você aprendeu.",
      color: "bg-emerald-50 text-emerald-600",
      onClick: () => sendAuto(`Crie exercícios de fixação de múltipla escolha sobre a aula "${lessonTitle}".`),
    },
    {
      icon: Brain,
      title: "Pensar e Responder",
      description: "Desafios abertos para você explicar com suas próprias palavras.",
      color: "bg-purple-50 text-purple-600",
      onClick: () => sendAuto(`Faça 3 perguntas abertas e reflexivas sobre a aula "${lessonTitle}" para eu responder com minhas próprias palavras.`),
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
          className="flex items-start gap-3 p-4 text-left bg-gray-30 border border-gray-200 rounded-xl hover:border-[black] hover:bg-gray-50 transition shadow-md cursor-pointer"
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