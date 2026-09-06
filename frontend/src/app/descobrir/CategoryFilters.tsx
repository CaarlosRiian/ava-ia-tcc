"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LayoutGrid, Palette, BrainCircuit, FlaskConical, UserRound, PenTool, ChefHat,
  Code2, Megaphone, Briefcase, Cloud, Wallet, BookOpen, } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  activeCategory: number | null;
  onSelect: (id: number | null) => void;
}

const ICON_MAP: { keywords: string[]; icon: React.ElementType }[] = [
  { keywords: ["design", "audiovisual"], icon: Palette },
  { keywords: ["dados", "ia", "inteligência"], icon: BrainCircuit },
  { keywords: ["ciências", "ciencia"], icon: FlaskConical },
  { keywords: ["pessoal"], icon: UserRound },
  { keywords: ["ux", "ui"], icon: PenTool },
  { keywords: ["gastronomia"], icon: ChefHat },
  { keywords: ["programação", "programacao", "dev"], icon: Code2 },
  { keywords: ["marketing", "vendas"], icon: Megaphone },
  { keywords: ["negócios", "negocios", "gestão", "gestao"], icon: Briefcase },
  { keywords: ["infraestrutura", "cloud", "devops"], icon: Cloud },
  { keywords: ["finanças", "financas", "investimentos"], icon: Wallet },
];

function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();
  const match = ICON_MAP.find((entry) => entry.keywords.some((k) => normalized.includes(k)));
  return match?.icon ?? BookOpen;
}

export default function CategoryFilters({ categories, activeCategory, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFades = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateFades();
    window.addEventListener("resize", updateFades);
    return () => window.removeEventListener("resize", updateFades);
  }, [categories]);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative mb-10 group/filters">
      <div
        className={`pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#F8F9FA] to-transparent transition-opacity duration-200 ${
          showLeftFade ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[#F8F9FA] to-transparent transition-opacity duration-200 ${
          showRightFade ? "opacity-100" : "opacity-0"
        }`}
      />

      {showLeftFade && (
        <button
          onClick={() => scrollBy(-240)}
          aria-label="Rolar categorias para a esquerda"
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors opacity-0 group-hover/filters:opacity-100"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {showRightFade && (
        <button
          onClick={() => scrollBy(240)}
          aria-label="Rolar categorias para a direita"
          className="absolute -right-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors opacity-0 group-hover/filters:opacity-100"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateFades}
        className="flex gap-2.5 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 flex items-center gap-2 ${
            activeCategory === null
              ? "bg-[#FF7A00] text-white shadow-lg shadow-blue-200/70"
              : "bg-white text-gray-500 border border-gray-200/80 hover:border-gray-300 hover:text-gray-700 shadow-sm"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Todos
        </button>

        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-sm cursor-pointer font-bold transition-all duration-200 flex items-center gap-2 border ${
                isActive
                  ? "bg-[#FF7A00] border-[#FF7A00] text-white shadow-lg shadow-blue-200/70"
                  : "bg-white text-gray-500 border-gray-200/80 hover:border-gray-300 hover:text-gray-700 shadow-sm"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-gray-400"}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}