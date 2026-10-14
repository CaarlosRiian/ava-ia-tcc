"use client";

import { useEffect, useState } from "react";
import { NotebookPen, Check } from "lucide-react";

interface LessonNotesProps {
  lessonId: number;
}

export default function LessonNotes({ lessonId }: LessonNotesProps) {
  const storageKey = `lesson_notes_${lessonId}`;

  const [notes, setNotes] = useState<string>(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem(storageKey) ?? "" : "";
    } catch {
      return "";
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
    const timer = setTimeout(() => {
      try {
        if (notes) localStorage.setItem(storageKey, notes);
        else localStorage.removeItem(storageKey);
        setSaved(true);
      } catch {
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [notes, storageKey]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-[black]" /> Minhas anotações
        </h3>
        <span
          aria-live="polite"
          className={`text-[11px] font-semibold flex items-center gap-1 text-emerald-600 transition-opacity ${saved && notes ? "opacity-100" : "opacity-0"}`}
        >
          <Check size={12} /> Salvo
        </span>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label="Anotações da aula"
        placeholder="Escreva aqui o que for importante nesta aula..."
        className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2F52E0] text-sm text-gray-800 placeholder-gray-400 resize-y transition"
      />
      <p className="text-[11px] text-gray-400">
        As anotações ficam salvas neste navegador, separadas por aula.
      </p>
    </div>
  );
}