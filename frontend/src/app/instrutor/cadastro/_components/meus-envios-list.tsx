"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, History, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";

interface MinhaSolicitacao {
  id: number;
  especialidade: string;
  status: "Pendente" | "Aprovado" | "Rejeitado" | "pendente" | "aprovado" | "rejeitado" | "pending" | "approved" | "rejected";
  created_at?: string;
  motivo_rejeicao?: string; 
}

interface MeusEnviosListProps {
  solicitacoes: MinhaSolicitacao[];
  loading: boolean;
}

export function MeusEnviosList({ solicitacoes, loading }: MeusEnviosListProps) {
  const [ordem, setOrdem] = useState<"recente" | "antigo">("recente");

  const getStatusLabel = (status: string) => {
    const cleanStatus = status.toLowerCase();
    if (cleanStatus === "pending" || cleanStatus === "pendente") return "Pendente";
    if (cleanStatus === "approved" || cleanStatus === "aprovado") return "Aprovado";
    if (cleanStatus === "rejected" || cleanStatus === "rejeitado") return "Rejeitado";
    return status; 
  };

  const alternarOrdem = () => {
    setOrdem((prev) => (prev === "recente" ? "antigo" : "recente"));
  };

  const solicitacoesOrdenadas = [...solicitacoes].sort((a, b) => {
    const dataA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dataB = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (ordem === "recente") {
      return dataB - dataA; 
    } else {
      return dataA - dataB; 
    }
  });

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-500" />
            <div>
              <CardTitle className="text-lg font-bold">Meus Envios</CardTitle>
              <CardDescription>Acompanhe o andamento</CardDescription>
            </div>
          </div>

          {!loading && solicitacoes.length > 0 && (
            <button
              type="button"
              onClick={alternarOrdem}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors cursor-pointer select-none"
              title="Clique para inverter a ordem"
            >
              {ordem === "recente" ? (
                <>
                  <ArrowDown className="h-3.5 w-3.5 text-gray-500" />
                  <span>Mais recentes</span>
                </>
              ) : (
                <>
                  <ArrowUp className="h-3.5 w-3.5 text-gray-500" />
                  <span>Mais antigos</span>
                </>
              )}
            </button>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-4">Carregando histórico...</p>
          ) : solicitacoes.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-xs text-gray-400 font-medium">Você ainda não realizou solicitações.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {solicitacoesOrdenadas.map((req) => {
                const statusClean = req.status.toLowerCase();
                const isPendente = statusClean === "pending" || statusClean === "pendente";
                const isAprovado = statusClean === "approved" || statusClean === "aprovado";
                const isRejeitado = statusClean === "rejected" || statusClean === "rejeitado";

                return (
                  <div 
                    key={req.id} 
                    className="p-4 rounded-2xl border border-gray-200 shadow-md flex flex-col gap-2 bg-[white]"
                  >
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`rounded-xl px-3.5 py-2.5 font-bold border-none flex items-center gap-1 text-[12px] ${
                          isPendente 
                            ? "bg-yellow-100 text-yellow-600" 
                            : isAprovado 
                            ? "bg-emerald-100 text-emerald-600" 
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isPendente && <Clock className="h-3 w-3" />}
                        {isAprovado && <CheckCircle className="h-3 w-3" />}
                        {isRejeitado && <XCircle className="h-3 w-3" />}
                        
                        {getStatusLabel(req.status)}
                      </Badge>

                      <span className="text-[10px] text-gray-400 font-medium">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString("pt-BR") : "Recentemente"}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Especialidade</p>
                      <p className="text-sm text-[#161B1D] font-bold">{req.especialidade}</p>
                    </div>

                    {isRejeitado && (
                      <div className="mt-1 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-black-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700">
                          <p className="font-bold text-black">Motivo da Rejeição:</p>
                          <p className="mt-0.5 text-black opacity-90 leading-relaxed">
                            {req.motivo_rejeicao || "Nenhum motivo específico foi informado pela administração."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}