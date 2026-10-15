"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock, ExternalLink, FileText, AlertCircle, Calendar } from "lucide-react";

import { Solicitacao } from "@/data/solicitacoes";

interface RequestCardProps {
  s: Solicitacao & {
    id: number;
    linkedin_url?: string;
    portfolio_url?: string;
    document?: string;
    documento?: string | null;
    arquivo?: string | null;
    created_at?: string;
    dataEnvio?: string;
    motivo_rejeicao?: string;
  };
  onAprovar: (id: number) => void;
  onRejeitar: (id: number) => void;
}

export function RequestCard({
  s,
  onAprovar,
  onRejeitar,
}: RequestCardProps) {
  const urlLinkedin = s.linkedin_url || s.linkedin;
  const urlPortfolio = s.portfolio_url || s.portfolio;
  const urlDocumento = s.documento || s.arquivo || s.document;
  const dataFormatada = s.created_at || s.dataEnvio;

  const statusClean = (s.status || "").toLowerCase();
  const isPendente = statusClean === "pendente" || statusClean === "pending";
  const isAprovado = statusClean === "aprovado" || statusClean === "approved";
  const isRejeitado = statusClean === "rejeitado" || statusClean === "rejected";

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarFallback className="bg-[#FF7A00] text-white text-lg font-bold">
              {s.especialidade?.slice(0, 2).toUpperCase() || "IN"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#161B1D]">
                  {s.nome ? s.nome.replace(/_/g, " ") : "Instrutor Sem Nome"}
                </h3>
                <p className="text-sm font-semibold text-[gray]">
                  {s.especialidade}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {dataFormatada && (
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {new Date(dataFormatada).toLocaleDateString("pt-BR")}
                  </span>
                )}

                <Badge
                  variant="outline"
                  className={`rounded-xl px-3 py-1 font-bold border-none flex items-center gap-1 text-xs ${
                    isPendente
                      ? "bg-amber-50 text-amber-600"
                      : isAprovado
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {isPendente && <Clock className="h-3.5 w-3.5" />}
                  {isAprovado && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {isRejeitado && <XCircle className="h-3.5 w-3.5" />}
                  <span className="capitalize">{isPendente ? "Pendente" : isAprovado ? "Aprovado" : "Rejeitado"}</span>
                </Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {s.bio || "Nenhuma biografia informada pelo candidato."}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {urlLinkedin && (
                <a href={urlLinkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-xs font-semibold hover:bg-gray-50 h-9 cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                    LinkedIn
                  </Button>
                </a>
              )}

              {urlPortfolio && (
                <a href={urlPortfolio} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-xs font-semibold hover:bg-gray-50 h-9 cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                    Portfólio
                  </Button>
                </a>
              )}

              {urlDocumento && (
                <a href={urlDocumento} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-xs font-semibold hover:bg-gray-50 h-9 cursor-pointer">
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    Documento
                  </Button>
                </a>
              )}
            </div>

            {isRejeitado && s.motivo_rejeicao && (
              <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-red-700">
                  <span className="font-bold">Motivo da Recusa: </span>
                  <span>{s.motivo_rejeicao}</span>
                </div>
              </div>
            )}

            {isPendente && (
              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2">
                <Button
                  className="bg-[#FF7A00] hover:bg-[#e06b00] text-white font-bold rounded-xl gap-1.5 cursor-pointer h-10 px-5 shadow-sm transition-all" 
                  onClick={() => onAprovar(s.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprovar Candidato
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => onRejeitar(s.id)} 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl gap-1.5 cursor-pointer h-10 px-5 border border-red-100 shadow-none transition-all" 
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}