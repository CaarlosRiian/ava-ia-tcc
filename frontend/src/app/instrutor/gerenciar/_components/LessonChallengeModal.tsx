"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Award } from "lucide-react";

interface LessonChallengeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  challengeEnabled: boolean;
  setChallengeEnabled: (enabled: boolean) => void;
  challengeTitle: string;
  setChallengeTitle: (title: string) => void;
  challengeDescription: string;
  setChallengeDescription: (desc: string) => void;
  challengeCriteria: string;
  setChallengeCriteria: (criteria: string) => void;
  onRemove: () => void;
}

export const LessonChallengeModal = ({
  isOpen,
  onOpenChange,
  challengeEnabled,
  setChallengeEnabled,
  challengeTitle,
  setChallengeTitle,
  challengeDescription,
  setChallengeDescription,
  challengeCriteria,
  setChallengeCriteria,
  onRemove,
}: LessonChallengeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-xl rounded-3xl p-6 shadow-xl border-none max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-[#FF7A00] rounded-2xl">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-gray-900">
                Atividade Prática com IA
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Defina o desafio e os critérios para feedback automático da IA aos alunos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex items-center justify-between bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
            <div>
              <span className="text-xs font-bold text-gray-800 block">Habilitar Atividade Prática</span>
              <span className="text-[11px] text-gray-500">Permite feedback automático da IA para os alunos.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={challengeEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setChallengeEnabled(checked);
                  if (!checked) {
                    setChallengeTitle("");
                    setChallengeDescription("");
                    setChallengeCriteria("");
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF7A00]"></div>
            </label>
          </div>

          {challengeEnabled && (
            <div className="space-y-4 pt-1 animate-fade-in">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Título da Atividade
                </Label>
                <Input
                  className="bg-white border-gray-200 rounded-xl h-11 text-sm focus-visible:ring-[#FF7A00]"
                  placeholder="Ex: Análise de Código e Refatoração"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Enunciado da Questão
                </Label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none text-gray-800 shadow-sm"
                  placeholder="Descreva o que o aluno deve analisar ou desenvolver..."
                  value={challengeDescription}
                  onChange={(e) => setChallengeDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Gabarito / Resposta Esperada (para a IA avaliar)
                </Label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none text-gray-800 shadow-sm"
                  placeholder="Ex: O aluno deve mencionar o padrão DTO e tratamento de exceções..."
                  value={challengeCriteria}
                  onChange={(e) => setChallengeCriteria(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {challengeEnabled ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onRemove}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs h-11 px-4 rounded-xl shadow-none transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Remover Atividade
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-5 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-[#FF7A00] hover:bg-[#ea7306] text-white h-11 px-6 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Salvar e Concluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};