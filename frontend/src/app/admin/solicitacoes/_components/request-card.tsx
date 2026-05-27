"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock, ExternalLink, FileText } from "lucide-react";

import { Solicitacao } from "@/data/solicitacoes";

interface RequestCardProps {
  s: Solicitacao & {
    linkedin_url?: string;
    portfolio_url?: string;
    document?: string;
    documento?: string | null;
    arquivo?: string | null;
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

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarFallback className="bg-[#2F52E0] text-white text-lg font-bold">
              {s.especialidade?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#161B1D]">
                  {s.nome ? s.nome.replace(/_/g, " ") : "Instrutor Sem Nome"}
                </h3>
                <p className="text-sm text-gray-500">
                  {s.especialidade}
                </p>
              </div>

              <Badge
                variant="outline"
                className={
                  s.status === "pendente"
                    ? "border-yellow-500 text-yellow-500"
                    : s.status === "aprovado"
                    ? "border-green-500 text-green-500"
                    : "border-red-500 text-red-500"
                }
              >
                {s.status === "pendente" && (
                  <Clock className="h-4 w-4 mr-1" />
                )}
                {s.status}
              </Badge>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              {s.bio}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {urlLinkedin && (
                <a href={urlLinkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="cursor-pointer p-5">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    LinkedIn
                  </Button>
                </a>
              )}

              {urlPortfolio && (
                <a href={urlPortfolio} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="cursor-pointer p-5">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Portfólio
                  </Button>
                </a>
              )}

              {urlDocumento && (
                <a href={urlDocumento} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="cursor-pointer p-5">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Documento
                  </Button>
                </a>
              )}
            </div>

            {s.status === "pendente" && (
              <div className="flex gap-2 pt-2">
                <Button
                  className="bg-[#2F52E0] hover:bg-[#1e3bb3] rounded-xl gap-1 cursor-pointer p-4 px-6" 
                  onClick={() => onAprovar(s.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => onRejeitar(s.id)} 
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-1 cursor-pointer p-4 px-6 shadow-sm" 
                >
                  <XCircle className="h-4 w-4 mr-1" />
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