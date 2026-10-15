"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestCard } from "./request-card";
import { Solicitacao } from "@/data/solicitacoes";
import { ArrowDown, ArrowUp, Inbox } from "lucide-react";

export type SolicitacaoComDatas = Solicitacao & {
  id: number;
  created_at?: string;
  dataEnvio?: string;
  motivo_rejeicao?: string;
};

interface Props {
  solicitacoes: SolicitacaoComDatas[];
  onAprovar: (id: number) => void;
  onRejeitar: (id: number) => void;
}

const TABS = [
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Aprovados" },
  { value: "rejeitado", label: "Rejeitados" },
  { value: "todas", label: "Todas" },
] as const;

export function SolicitacoesTabs({
  solicitacoes,
  onAprovar,
  onRejeitar,
}: Props) {
  const [ordem, setOrdem] = useState<"recente" | "antigo">("recente");

  const alternarOrdem = () => {
    setOrdem((prev) => (prev === "recente" ? "antigo" : "recente"));
  };

  const filtrarEOrdenar = (statusAba: string) => {
    const listaFiltrada = solicitacoes.filter((s) => {
      const statusClean = (s.status || "").toLowerCase();
      if (statusAba === "todas") return true;
      if (statusAba === "pendente") return statusClean === "pendente" || statusClean === "pending";
      if (statusAba === "aprovado") return statusClean === "aprovado" || statusClean === "approved";
      if (statusAba === "rejeitado") return statusClean === "rejeitado" || statusClean === "rejected";
      return statusClean === statusAba;
    });

    return listaFiltrada.sort((a, b) => {
      const rawDataA = a.created_at || a.dataEnvio;
      const rawDataB = b.created_at || b.dataEnvio;
      const dataA = rawDataA ? new Date(rawDataA).getTime() : 0;
      const dataB = rawDataB ? new Date(rawDataB).getTime() : 0;

      return ordem === "recente" ? dataB - dataA : dataA - dataB;
    });
  };

  const getCount = (statusAba: string) => {
    if (statusAba === "todas") return solicitacoes.length;
    return solicitacoes.filter((s) => {
      const statusClean = (s.status || "").toLowerCase();
      if (statusAba === "pendente") return statusClean === "pendente" || statusClean === "pending";
      if (statusAba === "aprovado") return statusClean === "aprovado" || statusClean === "approved";
      if (statusAba === "rejeitado") return statusClean === "rejeitado" || statusClean === "rejected";
      return statusClean === statusAba;
    }).length;
  };

  return (
    <Tabs defaultValue="pendente" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <TabsList className="bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/60 h-auto flex-wrap">
          {TABS.map((t) => {
            const count = getCount(t.value);
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <span>{t.label}</span>
                <span className="bg-gray-200/70 text-gray-700 data-[state=active]:bg-orange-100 data-[state=active]:text-[#FF7A00] text-[11px] px-2 py-0.5 rounded-full font-semibold">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <button
          type="button"
          onClick={alternarOrdem}
          className="self-start sm:self-auto flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors cursor-pointer select-none"
          title="Clique para inverter a ordem de exibição"
        >
          {ordem === "recente" ? (
            <>
              <ArrowDown className="h-3.5 w-3.5 text-[#FF7A00]" />
              <span>Mais recentes</span>
            </>
          ) : (
            <>
              <ArrowUp className="h-3.5 w-3.5 text-[#FF7A00]" />
              <span>Mais antigos</span>
            </>
          )}
        </button>
      </div>

      {TABS.map((tab) => {
        const itens = filtrarEOrdenar(tab.value);

        return (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-0">
            {itens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-center">
                <div className="p-3 bg-orange-50 rounded-2xl mb-3">
                  <Inbox className="h-6 w-6 text-[#FF7A00]" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">Nenhuma solicitação encontrada</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Não existem envios na categoria <strong className="font-semibold text-gray-700">"{tab.label}"</strong> no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {itens.map((s) => (
                  <RequestCard
                    key={s.id}
                    s={s}
                    onAprovar={onAprovar}
                    onRejeitar={onRejeitar}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}