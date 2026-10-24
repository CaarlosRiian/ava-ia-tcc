import { Globe, Lock } from "lucide-react";
import type { Module } from "@/types/course";

type Props = {
  modules: Module[];
  selectedModule: string;
  onModuleChange: (val: string) => void;
  title: string;
  onTitleChange: (val: string) => void;
  visibility: string;
  onVisibilityChange: (val: string) => void;
  disabled?: boolean;
};

export const LessonBasicInfo = ({
  modules,
  selectedModule,
  onModuleChange,
  title,
  onTitleChange,
  visibility,
  onVisibilityChange,
  disabled,
}: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
          Módulo
        </label>
        <select
          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
          value={selectedModule}
          onChange={(e) => onModuleChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Selecione um módulo</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
          Título da Aula
        </label>
        <input
          className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
          placeholder="Ex: Introdução ao tema"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
          Visibilidade
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onVisibilityChange("publico")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              visibility === "publico"
                ? "border-[#FF7A00] bg-orange-50/50 text-[#FF7A00]"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Globe className="h-4 w-4" /> Público
          </button>
          <button
            type="button"
            onClick={() => onVisibilityChange("privado")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              visibility === "privado"
                ? "border-[#FF7A00] bg-orange-50/50 text-[#FF7A00]"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Lock className="h-4 w-4" /> Privado
          </button>
        </div>
      </div>
    </div>
  );
};