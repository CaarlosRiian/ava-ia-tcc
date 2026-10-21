import React, { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import { X } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface CategoryTagInputProps {
  selectedCategoryIds: number[];
  onChange: (ids: number[]) => void;
}

export function CategoryTagInput({ selectedCategoryIds, onChange }: CategoryTagInputProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/categories/")
      .then((res) => {
        const data = res.data;
        setAllCategories(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => console.error("Erro ao carregar categorias:", err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategories = allCategories.filter((cat) =>
    selectedCategoryIds.includes(cat.id)
  );

  const availableCategories = allCategories.filter(
    (cat) =>
      !selectedCategoryIds.includes(cat.id) &&
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: number) => {
    onChange([...selectedCategoryIds, id]);
    setSearchTerm("");
    setIsOpen(false); 
  };

  const handleRemove = (id: number) => {
    onChange(selectedCategoryIds.filter((catId) => catId !== id));
  };

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-xs font-bold text-gray-700 block">
        Categorias — <span className="font-normal text-gray-500">busque e selecione (não é possível criar novas)</span>
      </label>

      <div
        onClick={() => setIsOpen(true)}
        className="min-h-[46px] p-2 bg-white border border-[#FF7A00]/40 rounded-xl flex flex-wrap items-center gap-2 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] transition-all shadow-sm cursor-text"
      >
        {selectedCategories.map((cat) => (
          <span
            key={cat.id}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFF4EA] text-[#D95D00] border border-[#FFD8B8] rounded-xl text-xs font-semibold"
          >
            {cat.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(cat.id);
              }}
              className="text-[#D95D00]/70 hover:text-[#D95D00] hover:bg-gray-100 rounded-md p-3 focus:outline-none cursor-pointer transition-colors"
            >
              <X size={13} />
            </button>
          </span>
        ))}

        <input
          type="text"
          placeholder={selectedCategories.length === 0 ? "Buscar categorias..." : "Adicionar outra..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[120px] bg-transparent focus:outline-none text-xs text-gray-800 placeholder-gray-400 py-1"
        />
      </div>

      {isOpen && availableCategories.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-0.5">
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#FFF4EA] hover:text-[#D95D00] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}