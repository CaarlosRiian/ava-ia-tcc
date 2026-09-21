"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Atividade Prática</DialogTitle>
          <DialogDescription>
            Defina o desafio e os critérios para feedback automático da IA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            <span className="text-xs font-medium text-zinc-700">Habilitar atividade nesta aula</span>
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
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {challengeEnabled && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 mb-1 block">Título da Atividade</label>
                <input
                  className="w-full border p-2 rounded-xl text-sm bg-white"
                  placeholder="Ex: Análise do Caso Prático"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 mb-1 block">Enunciado da Questão</label>
                <textarea
                  rows={3}
                  className="w-full border p-2 rounded-xl text-sm bg-white resize-none"
                  placeholder="Descreva o que o aluno deve analisar..."
                  value={challengeDescription}
                  onChange={(e) => setChallengeDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 mb-1 block">Gabarito / Resposta Esperada</label>
                <textarea
                  rows={2}
                  className="w-full border p-2 rounded-xl text-sm bg-white resize-none"
                  placeholder="Ex: O aluno precisa citar os conceitos centrais..."
                  value={challengeCriteria}
                  onChange={(e) => setChallengeCriteria(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          {challengeEnabled ? (
            <button
              type="button"
              onClick={onRemove}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-200 rounded-lg transition shadow-sm cursor-pointer"
            >
              Remover Atividade
            </button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs h-9"
          >
            Concluir / Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};