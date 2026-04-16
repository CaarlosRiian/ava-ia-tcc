import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock, ExternalLink, FileText } from "lucide-react";
import { Solicitacao } from "@/data/solicitacoes"; 

interface RequestCardProps {
  s: Solicitacao;
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
}

export function RequestCard({ s, onAprovar, onRejeitar }: RequestCardProps) {
  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarFallback className="bg-[#2F52E0] text-white text-lg font-bold">
              {s.nome.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#161B1D]">{s.nome}</h3>
                <p className="text-sm text-gray-400">{s.email} · {s.dataEnvio}</p>
              </div>
              <Badge variant="outline" className={
                s.status === "pendente" ? "border-yellow-500 text-yellow-500" :
                s.status === "aprovado" ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
              }>
                {s.status === "pendente" && <Clock className="h-4 w-4 mr-1" />}
                {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
              </Badge>
            </div>

            <Badge variant="secondary" className="font-bold bg-gray-200">{s.especialidade}</Badge>
            <p className="text-sm text-gray-500 leading-relaxed">{s.bio}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {s.linkedin && (
                <a href={s.linkedin} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-gray-200 text-gray-600">
                    <ExternalLink className="h-3.5 w-3.5" /> 
                    <span className="font-bold text-xs">LinkedIn</span>
                  </Button>
                </a>
              )}
              {s.portfolio && (
                <a href={s.portfolio} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-gray-200 text-gray-600">
                    <ExternalLink className="h-3.5 w-3.5" /> 
                    <span className="font-bold text-xs">Portfólio</span>
                  </Button>
                </a>
              )}
              {s.documento && (
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-[#2F52E0]/20 bg-[#2F52E0]/5 text-[#2F52E0] hover:bg-[#2F52E0]/10">
                  <FileText className="h-3.5 w-3.5" /> 
                  <span className="font-bold text-xs">{s.documento}</span>
                </Button>
              )}
            </div>

            {s.status === "pendente" && (
              <div className="flex gap-2 pt-2">
                <Button 
                  size="lg" 
                  className="bg-[#2F52E0] hover:bg-[#1e3bb3] rounded-x gap-1 cursor-pointer px-6" 
                  onClick={() => onAprovar(s.id)}
                >
                  <CheckCircle2 className="h-4 w-4" /> Aprovar
                </Button>
                <Button 
                  size="lg" 
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700 text-white rounded-x gap-1 cursor-pointer px-6 shadow-sm" 
                  onClick={() => onRejeitar(s.id)}
                >
                  <XCircle className="h-4 w-4 text-white" /> Rejeitar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}