"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string | number;
  name: string;
}

interface OnboardingModalProps {
  categories: Category[];
  onComplete: (selectedInterests: string[]) => Promise<void>;
  onSkip: () => Promise<void>;
}

export default function OnboardingModal({ categories, onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState<"interests" | "skipInfo">("interests");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (categoryName: string) => {
    if (selectedInterests.includes(categoryName)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== categoryName));
    } else {
      setSelectedInterests([...selectedInterests, categoryName]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onComplete(selectedInterests);
    } catch (error) {
      toast.error("Erro ao salvar preferências.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipClick = async () => {
    setStep("skipInfo");
  };

  const handleFinishSkip = async () => {
    try {
      setLoading(true);
      await onSkip();
    } catch (error) {
      toast.error("Erro ao concluir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-gray-100 p-8 space-y-6 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-2 " />

        {step === "interests" ? (
          <>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-[#161B1D] tracking-tight">O que você quer aprender?</h2>
              <p className="text-sm text-gray-500 font-normal">
                Selecione os seus principais interesses para personalizarmos a sua experiência na plataforma.
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-2 gap-2.5 py-2">
              {categories.map((cat) => {
                const isSelected = selectedInterests.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className={`flex items-center justify-between p-3.5 bg-white rounded-2xl border text-xs font-bold transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-[#FF7A00] text-[#FF7A00] shadow-sm shadow-orange-100"
                        : "bg-gray-50/50 border-gray-200/80 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected ? "bg-[#FF7A00] border-[#FF7A00] text-white" : "border-gray-300 bg-white"
                    }`}>
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipClick}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                Pular por enquanto
              </button>
              
              <Button
                type="button"
                onClick={handleSave}
                disabled={loading || selectedInterests.length === 0}
                className="w-full sm:flex-1 bg-[#FF7A00] hover:bg-[#ea7306] text-white font-black py-6 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Salvando..." : "Salvar e Continuar"}
                <ArrowRight size={16} />
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#161B1D] tracking-tight">Sem problemas!</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                Você pode personalizar seus interesses e especialidades a qualquer momento indo nas <strong className="text-zinc-800">Configurações do Perfil</strong>.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleFinishSkip}
              disabled={loading}
              className="w-full bg-[#161B1D] hover:bg-black text-white font-black py-6 rounded-2xl cursor-pointer shadow-md"
            >
              {loading ? "Carregando..." : "Entendido!"}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}