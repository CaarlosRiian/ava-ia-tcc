"use client";

import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StatsCards } from "./_components/stats-cards";
import { RequestCard } from "./_components/request-card";

import { useSolicitacoes } from "./hooks/useSolicitacoes";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminSolicitacoes() {
  const {
    solicitacoes,
    loading,
    atualizarStatus,
  } = useSolicitacoes();

  const filtrar = (status: string) =>
    status === "todas"
      ? solicitacoes
      : solicitacoes.filter((s) => s.status === status);

  if (loading) {
    return <LoadingScreen text="Carregando as solicitações..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <Breadcrumb
        items={[
          { label: "Painel do Administrador" },
          { label: "Gerenciar Solicitações" }
        ]}
      />

      <main className="container mx-auto max-w-5xl pt-6 pb-12 px-4 space-y-8">
        <h1 className="text-3xl font-black text-[#161B1D]">
          Painel do Administrador
        </h1>

        <StatsCards
          pendentes={
            solicitacoes.filter((s) => s.status === "pendente").length
          }
          aprovados={
            solicitacoes.filter((s) => s.status === "aprovado").length
          }
          rejeitados={
            solicitacoes.filter((s) => s.status === "rejeitado").length
          }
        />

        <Tabs defaultValue="pendente" className="w-full">
          <TabsList className="bg-gray-200/50 p-5 rounded-x">
            {["pendente", "aprovado", "rejeitado", "todas"].map(
              (t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="capitalize font-bold cursor-pointer"
                >
                  {t}
                </TabsTrigger>
              )
            )}
          </TabsList>

          {["pendente", "aprovado", "rejeitado", "todas"].map(
            (tab) => (
              <TabsContent
                key={tab}
                value={tab}
                className="space-y-4 mt-6"
              >
                {filtrar(tab).map((s) => (
                  <RequestCard
                    key={s.id}
                    s={s}
                    onAprovar={(id) =>
                      atualizarStatus(id, "aprovado")
                    }
                    onRejeitar={(id) =>
                      atualizarStatus(id, "rejeitado")
                    }
                  />
                ))}
              </TabsContent>
            )
          )}
        </Tabs>
      </main>
    </div>
  );
}