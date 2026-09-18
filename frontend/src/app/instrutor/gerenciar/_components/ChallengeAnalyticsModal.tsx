"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StudentSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: "approved" | "needs_revision";
  aiFeedback: string;
  studentAnswer: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  challengeTitle: string;
  submissions: StudentSubmission[];
}

export const ChallengeAnalyticsModal = ({
  isOpen,
  onClose,
  lessonTitle,
  challengeTitle,
  submissions = [],
}: Props) => {
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  const totalStudents = 35; 
  const totalSubmitted = submissions.length;
  const pendingStudents = Math.max(0, totalStudents - totalSubmitted);
  
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const successRate = totalSubmitted > 0 ? Math.round((approvedCount / totalSubmitted) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[850px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Relatório da Atividade
              </span>
              <DialogTitle className="text-lg font-bold text-zinc-900 mt-1">
                {challengeTitle || "Atividade Prática"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Aula vinculada: <span className="font-medium text-zinc-700">{lessonTitle}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-1 py-2 flex-1">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
              <p className="text-xs font-medium text-zinc-500">Alunos que Responderam</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-zinc-900">{totalSubmitted}</span>
                <span className="text-xs text-zinc-400">/ {totalStudents} total</span>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
              <p className="text-xs font-medium text-zinc-500">Taxa de Sucesso (IA)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-600">{successRate}%</span>
                <span className="text-xs text-zinc-400">aprovados de primeira</span>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
              <p className="text-xs font-medium text-zinc-500">Alunos Pendentes</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-600">{pendingStudents}</span>
                <span className="text-xs text-zinc-400">ainda não enviaram</span>
              </div>
            </div>
          </div>

          {selectedSubmission ? (
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{selectedSubmission.studentName}</h4>
                  <p className="text-xs text-zinc-500">{selectedSubmission.studentEmail} • Enviado em {selectedSubmission.submittedAt}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                  className="text-xs h-8 cursor-pointer"
                >
                  ← Voltar para a lista
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 block mb-1">Resposta enviada pelo aluno:</label>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 text-xs text-zinc-700 whitespace-pre-wrap">
                    {selectedSubmission.studentAnswer}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-600">Feedback gerado pela IA:</label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedSubmission.status === "approved" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {selectedSubmission.status === "approved" ? "Aprovado pela IA" : "Necessita Revisão"}
                    </span>
                  </div>
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 whitespace-pre-wrap">
                    {selectedSubmission.aiFeedback}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Histórico de Envios da Turma</h3>
                <span className="text-xs text-zinc-500">{submissions.length} entregas registradas</span>
              </div>

              {submissions.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-xs">
                  Nenhum aluno enviou a atividade prática desta aula ainda.
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                      <tr>
                        <th className="p-3 font-medium">Aluno</th>
                        <th className="p-3 font-medium">Data / Hora</th>
                        <th className="p-3 font-medium">Status da IA</th>
                        <th className="p-3 font-medium text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-zinc-50/80 transition">
                          <td className="p-3 font-medium text-zinc-800">
                            {sub.studentName}
                            <span className="block text-[11px] text-zinc-400 font-normal">{sub.studentEmail}</span>
                          </td>
                          <td className="p-3 text-zinc-500">{sub.submittedAt}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              sub.status === "approved" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {sub.status === "approved" ? "Aprovado" : "Revisar"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="text-blue-600 hover:underline font-semibold cursor-pointer"
                            >
                              Ver Resposta
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-100 flex justify-end">
          <Button onClick={onClose} variant="outline" className="text-xs h-9 cursor-pointer">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};