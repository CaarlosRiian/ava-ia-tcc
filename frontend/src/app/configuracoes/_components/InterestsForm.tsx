"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/services/categories";
import { Check, Loader2 } from "lucide-react";

interface InterestsFormProps {
  interests: string[];
  setInterests: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Category {
  id: number;
  name: string;
}

export function InterestsForm({
  interests,
  setInterests,
}: InterestsFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : (data?.results || []));
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const toggleInterest = (categoryName: string) => {
    if (interests.includes(categoryName)) {
      setInterests(interests.filter((item) => item !== categoryName));
    } else {
      setInterests([...interests, categoryName]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#161B1D] flex items-center gap-2">
          Preferências e Interesses
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Selecione as áreas que você mais gosta para receber recomendações personalizadas na aba Explorar.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-3">
            Áreas de Interesse
          </label>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-[#2F52E0]" />
              Carregando opções...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = interests.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.name)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#FF7A00] text-white border-transparent shadow-xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}