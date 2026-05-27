"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, History } from "lucide-react";

interface MinhaSolicitacao {
  id: number;
  especialidade: string;
  status: "Pendente" | "Aprovado" | "Rejeitado" | "pendente" | "aprovado" | "rejeitado" | "pending" | "approved" | "rejected";
  created_at?: string;
}

interface MeusEnviosListProps {
  solicitacoes: MinhaSolicitacao[];
  loading: boolean;
}

export function MeusEnviosList({ solicitacoes, loading }: MeusEnviosListProps) {
  const getStatusLabel = (status: string) => {
    const cleanStatus = status.toLowerCase();
    if (cleanStatus === "pending" || cleanStatus === "pendente") return "Pendente";
    if (cleanStatus === "approved" || cleanStatus === "aprovado") return "Aprovado";
    if (cleanStatus === "rejected" || cleanStatus === "rejeitado") return "Rejeitado";
    return status; 
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 p-6 flex flex-row items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          <div>
            <CardTitle className="text-lg font-bold">Meus Envios</CardTitle>
            <CardDescription>Acompanhe o andamento</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-4">Carregando histórico...</p>
          ) : solicitacoes.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-xs text-gray-400 font-medium">Você ainda não realizou solicitações.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitacoes.map((req) => {
                const statusClean = req.status.toLowerCase();
                const isPendente = statusClean === "pending" || statusClean === "pendente";
                const isAprovado = statusClean === "approved" || statusClean === "aprovado";

                return (
                  <div 
                    key={req.id} 
                    className="p-4 rounded-2xl border border-gray-50 flex flex-col gap-2 bg-[#FBFBFB]"
                  >
                    <div className="flex items-center justify-between">
                      
                      <Badge 
                        variant="outline" 
                        className={`rounded-full px-2.5 py-0.5 font-bold border-none flex items-center gap-1 text-[11px] ${
                          isPendente 
                            ? "bg-yellow-50 text-yellow-600" 
                            : isAprovado 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {isPendente && <Clock className="h-3 w-3" />}
                        {isAprovado && <CheckCircle className="h-3 w-3" />}
                        {!isPendente && !isAprovado && <XCircle className="h-3 w-3" />}
                        
                        {getStatusLabel(req.status)}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Especialidade</p>
                      <p className="text-sm text-[#161B1D] font-bold">{req.especialidade}</p>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 self-end font-medium">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString("pt-BR") : "Recentemente"}
                    </p>
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