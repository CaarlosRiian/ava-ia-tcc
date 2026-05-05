"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestCard } from "./request-card";
import { Solicitacao } from "@/data/solicitacoes";

interface Props {
  solicitacoes: Solicitacao[];
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
}

const TABS = ["pendente", "aprovado", "rejeitado", "todas"] as const;

export function SolicitacoesTabs({
  solicitacoes,
  onAprovar,
  onRejeitar,
}: Props) {
  const filtrar = (status: string) =>
    status === "todas"
      ? solicitacoes
      : solicitacoes.filter((s) => s.status === status);

  return (
    <Tabs defaultValue="pendente" className="w-full">
      <TabsList className="bg-gray-200/50 p-4 rounded-x">
        {TABS.map((t) => (
          <TabsTrigger key={t} value={t} className="capitalize">
            {t}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => (
        <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
          {filtrar(tab).map((s) => (
            <RequestCard
              key={s.id}
              s={s}
              onAprovar={onAprovar}
              onRejeitar={onRejeitar}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}