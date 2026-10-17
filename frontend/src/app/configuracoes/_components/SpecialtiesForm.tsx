"use client";

import { GraduationCap, Lock, X } from "lucide-react";

type Category = {
  id: number | string;
  name: string;
};

type SpecialtiesFormProps = {
  specialties: string[];
  setSpecialties: React.Dispatch<React.SetStateAction<string[]>>;
  availableCategories?: Category[];
  primarySpecialty?: string; 
};

export function SpecialtiesForm({
  specialties,
  setSpecialties,
  availableCategories = [],
  primarySpecialty,
}: SpecialtiesFormProps) {
  
  const normalizeText = (text: string) => text.trim().toLowerCase();

  const handleSelectCategory = (categoryName: string) => {
    if (!categoryName) return;
    
    const alreadyExists = specialties.some(
      (item) => normalizeText(item) === normalizeText(categoryName)
    );

    if (!alreadyExists) {
      setSpecialties([...specialties, categoryName.trim()]);
    }
  };

  const handleRemove = (itemToRemove: string) => {
    if (primarySpecialty && normalizeText(itemToRemove) === normalizeText(primarySpecialty)) {
      return;
    }

    setSpecialties(
      specialties.filter(
        (item) => normalizeText(item) !== normalizeText(itemToRemove)
      )
    );
  };

  const unselectedCategories = availableCategories.filter((cat) => {
    const isPrimary = primarySpecialty && normalizeText(cat.name) === normalizeText(primarySpecialty);
    const isSelected = specialties.some((spec) => normalizeText(spec) === normalizeText(cat.name));
    return !isPrimary && !isSelected;
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center border border-orange-100">
          <GraduationCap size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Especialidades do Instrutor
          </h2>
          <p className="text-xs text-gray-500">
            Adicione mais áreas de atuação além da sua especialidade principal.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <select
          onChange={(e) => {
            handleSelectCategory(e.target.value);
            e.target.value = "";
          }}
          defaultValue=""
          className="flex-1 rounded-xl border border-gray-200 text-xs h-11 px-3 focus:outline-none focus:border-[#FF7A00] bg-white text-gray-800 cursor-pointer"
        >
          <option value="" disabled>
            {unselectedCategories.length > 0
              ? "Selecione uma especialidade do sistema para adicionar..."
              : "Todas as especialidades disponíveis já foram selecionadas."}
          </option>
          {unselectedCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {primarySpecialty && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 text-[#FF7A00] border border-orange-200 text-xs font-bold shadow-2xs">
            <Lock size={12} className="opacity-70" />
            {primarySpecialty} (Principal)
          </span>
        )}

        {specialties
          .filter((item) => !primarySpecialty || normalizeText(item) !== normalizeText(primarySpecialty))
          .map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50/80 text-[#FF7A00] border border-orange-100 text-xs font-semibold shadow-2xs transition hover:bg-orange-100"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="text-orange-400 hover:text-red-500 transition cursor-pointer"
                title="Remover especialidade"
              >
                <X size={14} />
              </button>
            </span>
          ))}

        {!primarySpecialty && specialties.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            Nenhuma especialidade selecionada ainda.
          </p>
        )}
      </div>
    </div>
  );
}