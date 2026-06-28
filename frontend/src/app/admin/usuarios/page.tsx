"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { UserStats } from "./_components/UserStats";
import { UserTable } from "./_components/UserTable";
import { ChangeRoleModal } from "./_components/ChangeRoleModal";
import { UserPagination } from "./_components/UserPagination";

import { useUsers } from "../usuarios/feature/users/useUsers";
import { Usuario } from "@/data/admType";
import { getMe, getAccessToken } from "@/services/auth";

export default function AdminUsuarios() {
  const { usuarios, loading, busca, setBusca, filtroRole, setFiltroRole, stats,
    handleChangeRole, handleBanUser, pagina, setPagina, } = useUsers();

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [termo, setTermo] = useState(busca);

  const [idUsuarioLogado, setIdUsuarioLogado] = useState<number | null>(null);

  useEffect(() => {
    async function carregarIdentidade() {
      try {
        const token = getAccessToken();
        if (token) {
          const dadosPerfil = await getMe(token);
          setIdUsuarioLogado(dadosPerfil.id);
        }
      } catch (error) {
        console.error("Não foi possível carregar o ID do usuário conectado:", error);
      }
    }
    carregarIdentidade();
  }, []);

  const handleAcaoBusca = (e: React.FormEvent) => {
    e.preventDefault();

    if (busca) {
      setTermo("");
      setBusca("");
    } else {
      setBusca(termo);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <Breadcrumb 
        items={[
          { label: "Painel do Administrador" },
          { label: "Gerenciamento de Usuários" }
        ]} 
      />

      <main className="max-w-5xl mx-auto pt-6 pb-12 px-4 space-y-6">

        <h1 className="text-2xl font-black text-[#161B1D]">
          Gerenciamento de Usuários
        </h1>

        <UserStats stats={stats} />

        <Card className="border border-gray-100 shadow-sm rounded-xl bg-white overflow-visible">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center">

            <form onSubmit={handleAcaoBusca} className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input className="pl-10 pr-24 h-11 w-full bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:border-transparent transition-all"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
              />

              <button type="submit" className={`absolute right-1.5 h-8 px-4 text-xs font-bold rounded-lg transition-colors cursor-pointer ${busca
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                : "bg-[#6366F1] hover:bg-[#5356E2] text-white"
                }`}
              >
                {busca ? "Limpar" : "Buscar"}
              </button>
            </form>

            <Select value={filtroRole} onValueChange={(v) => setFiltroRole(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white border border-gray-300 rounded-x text-gray-700 font-medium px-3 justify-between items-center focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all cursor-pointer">
                <SelectValue placeholder="Papel" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl p-1 z-50 min-w-[180px]">
                <SelectItem value="todos" className="rounded-lg py-2 px-3 text-sm text-gray-700 focus:bg-gray-50 cursor-pointer transition-colors"
                >
                  Todos
                </SelectItem>
                <SelectItem value="admin" className="rounded-lg py-2 px-3 text-sm text-gray-700 focus:bg-gray-50 cursor-pointer transition-colors"
                >
                  Admin
                </SelectItem>
                <SelectItem value="professor" className="rounded-lg py-2 px-3 text-sm text-gray-700 focus:bg-gray-50 cursor-pointer transition-colors"
                >
                  Professor
                </SelectItem>
                <SelectItem value="aluno" className="rounded-lg py-2 px-3 text-sm text-gray-700 focus:bg-gray-50 cursor-pointer transition-colors"
                >
                  Aluno
                </SelectItem>
              </SelectContent>
            </Select>

          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-2 bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-500 font-medium">
                <p>Carregando usuários...</p>
              </div>
            ) : (
              <UserTable
                usuarios={usuarios}
                idUsuarioLogado={idUsuarioLogado}
                onBan={handleBanUser}
                onOpenRole={(user) => {
                  setSelectedUser(user);
                  setOpenRoleModal(true);
                }}
                onEdit={() => { }}
              />
            )}

            {!loading && (
              <UserPagination
                paginaAtual={pagina}
                totalItens={stats.total}
                itensPorPagina={8}
                onPageChange={setPagina}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <ChangeRoleModal
        open={openRoleModal}
        onOpenChange={setOpenRoleModal}
        user={selectedUser}
        onConfirm={handleChangeRole}
      />
    </div>
  );
}