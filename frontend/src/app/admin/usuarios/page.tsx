"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { UserStats } from "./_components/UserStats";
import { UserTable } from "./_components/UserTable";
import { ChangeRoleModal } from "./_components/ChangeRoleModal";

import { useUsers } from "../usuarios/feature/users/useUsers";
import { Usuario } from "@/data/admType";

export default function AdminUsuarios() {
  const { usuarios, loading, busca, setBusca, filtroRole, setFiltroRole, stats,
    handleChangeRole, handleBanUser, pagina, setPagina, } = useUsers();

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header />

      <main className="max-w-5xl mx-auto py-8 px-4 space-y-6">

        <h1 className="text-2xl font-black">
          Gerenciamento de Usuários
        </h1>

        <UserStats stats={stats} />

        <Card>
          <CardContent className="pt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4" />
              <Input
                className="pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar usuário..."
              />
            </div>

            <Select value={filtroRole} onValueChange={(v) => setFiltroRole(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Papel" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="aluno">Aluno</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <UserTable
                usuarios={usuarios}
                onBan={handleBanUser}
                onOpenRole={(user) => {
                  setSelectedUser(user);
                  setOpenRoleModal(true);
                }}
                onEdit={() => {}}
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