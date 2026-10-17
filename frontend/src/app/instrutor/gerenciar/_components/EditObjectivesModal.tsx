"use client";

import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, } from "@/components/ui/alert-dialog";
import { Plus, X, CheckCircle2, Loader2, Target } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number | string;
  initialObjectives?: string[];
  onSave: (objectives: string[]) => Promise<void>;
  onShowToast: (message: string, type?: "success" | "error") => void;
};

export function EditObjectivesModal({
  open,
  onOpenChange,
  initialObjectives = [],
  onSave,
  onShowToast,
}: Props) {
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialObjectives && initialObjectives.length > 0) {
        setObjectives([...initialObjectives]);
      } else {
        setObjectives([
          "Domínio completo dos Conceitos Fundamentais e Arquitetura",
          "Aplicação prática de padrões recomendados pelo Mercado",
          "Desenvolvimento guiado de Projetos Reais e Escaláveis",
          "Mentoria e Inteligência Artificial orientada à prática"
        ]);
      }
    }
  }, [open]);

  const handleAddObjective = () => {
    const trimmed = newObjective.trim();
    if (!trimmed) return;
    
    const itemsToAdd = trimmed.split("\n").map(item => item.trim()).filter(Boolean);
    let addedCount = 0;
    const currentObjectives = [...objectives];
    
    for (const item of itemsToAdd) {
      if (!currentObjectives.includes(item)) {
        currentObjectives.push(item);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setObjectives(currentObjectives);
      setNewObjective("");
    } else {
      onShowToast("Este objetivo já foi adicionado.", "error");
    }
  };

  const handleRemoveObjective = (indexToRemove: number) => {
    setObjectives(objectives.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (objectives.length === 0) {
      onShowToast("Adicione pelo menos um objetivo de aprendizado.", "error");
      return;
    }

    setLoading(true);
    try {
      await onSave(objectives);
      onShowToast("Objetivos de aprendizado atualizados com sucesso!", "success");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      onShowToast("Falha ao salvar objetivos de aprendizado.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="!w-[90vw] !max-w-2xl bg-white rounded-[28px] border border-gray-100 shadow-2xl p-7 mx-auto overflow-hidden">
        
        <AlertDialogHeader className="space-y-1.5 text-left pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center border border-orange-100 shadow-2xs shrink-0">
              <Target size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-extrabold text-gray-900 tracking-tight">
                Gerenciar Objetivos de Aprendizado
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-gray-500">
                Defina as metas e competências que os alunos vão adquirir ao concluir esta disciplina.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Novo Objetivo ou Tópico
            </label>
            <div className="flex items-start gap-2">
              <textarea
                rows={2}
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Ex: Construção de APIs REST escaláveis utilizando Django REST Framework, autenticação JWT e conteinerização com Docker..."
                className="flex-1 rounded-xl border border-gray-200 p-3 text-xs text-gray-800 focus:border-[#FF7A00] outline-none transition bg-gray-50/50 focus:bg-white resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-5 h-[62px] rounded-xl bg-orange-50 text-[#FF7A00] hover:bg-orange-100 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-orange-100 shadow-2xs shrink-0"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Lista de Objetivos ({objectives.length})
              </label>
            </div>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {objectives.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-gray-400 text-xs">
                  Nenhum objetivo adicionado ainda.
                </div>
              ) : (
                objectives.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100 text-xs group transition hover:border-orange-200 hover:bg-white shadow-2xs gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-5 w-5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                        <CheckCircle2 size={13} className="stroke-[3]" />
                      </div>
                      <span className="font-semibold text-gray-700 text-xs leading-normal">
                        {item}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
                      title="Remover objetivo"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <AlertDialogFooter className="pt-3 border-t border-gray-100 flex gap-3">
            <AlertDialogCancel
              disabled={loading}
              className="flex-1 rounded-xl h-11 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer text-xs"
            >
              Cancelar
            </AlertDialogCancel>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl h-11 bg-[#FF7A00] hover:bg-[#ea7306] text-white font-bold shadow-sm shadow-orange-200 transition cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Objetivos"
              )}
            </button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}