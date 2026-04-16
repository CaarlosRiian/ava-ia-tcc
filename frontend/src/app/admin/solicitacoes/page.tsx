"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { StatsCards } from "./_components/stats-cards";
import { RequestCard } from "./_components/request-card";
import { mockSolicitacoes, Solicitacao } from "@/data/solicitacoes"; 

export default function AdminSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);

  const handleAction = (id: string, status: "aprovado" | "rejeitado") => {
    setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    status === "aprovado" ? toast.success("Aprovado!") : toast.error("Rejeitado.");
  };

  const filtrar = (status: string) => 
    status === "todas" ? solicitacoes : solicitacoes.filter(s => s.status === status);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <main className="container mx-auto max-w-5xl py-12 px-4 space-y-8">
        <h1 className="text-3xl font-black text-[#161B1D]">Painel do Administrador</h1>

        <StatsCards 
          pendentes={solicitacoes.filter(s => s.status === "pendente").length}
          aprovados={solicitacoes.filter(s => s.status === "aprovado").length}
          rejeitados={solicitacoes.filter(s => s.status === "rejeitado").length}
        />

        <Tabs defaultValue="pendente" className="w-full">
          <TabsList className="bg-gray-200/50 p-3 rounded-x">
            {["pendente", "aprovado", "rejeitado", "todas"].map(t => (
              <TabsTrigger key={t} value={t} className="rounded-l cursor-pointer font-bold capitalize">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {["pendente", "aprovado", "rejeitado", "todas"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
              {filtrar(tab).map((s) => (
                <RequestCard 
                  key={s.id} 
                  s={s} 
                  onAprovar={(id) => handleAction(id, "aprovado")} 
                  onRejeitar={(id) => handleAction(id, "rejeitado")} 
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}