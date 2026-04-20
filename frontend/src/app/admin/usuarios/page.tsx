"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Usuario, Role, Status, roleLabels, mockUsuarios } from "@/data/admType";
import { UserStats } from "./_components/UserStats";
import { UserTable } from "./_components/UserTable";

const PAGE_SIZE = 8;

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<Role | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<Status | "todos">("todos");
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [novoRole, setNovoRole] = useState<Role>("aluno");
  const [confirmandoBan, setConfirmandoBan] = useState<Usuario | null>(null);

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchBusca = u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase());
      const matchRole = filtroRole === "todos" || u.role === filtroRole;
      const matchStatus = filtroStatus === "todos" || u.status === filtroStatus;
      return matchBusca && matchRole && matchStatus;
    });
  }, [usuarios, busca, filtroRole, filtroStatus]);

  const stats = useMemo(() => ({
    total: usuarios.length,
    admins: usuarios.filter((u) => u.role === "admin").length,
    instrutores: usuarios.filter((u) => u.role === "instrutor").length,
    banidos: usuarios.filter((u) => u.status === "banido").length,
  }), [usuarios]);

  const paginados = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header />

      <main className="max-w-5xl mx-auto py-8 px-4 space-y-6">

        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Controle de papéis, permissões e status dos membros da plataforma.
          </p>
        </div>

        <UserStats stats={stats} />

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={busca}
                  onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
                  className="pl-9 rounded-x border-gray-100 bg-gray-50/50"
                />
              </div>
              <Select
                value={filtroRole}
                onValueChange={(v) => { setFiltroRole(v as Role | "todos"); setPagina(1); }}
              >
                <SelectTrigger className="md:w-[200px] rounded-x border-gray-200 bg-white cursor-pointer focus:ring-1 focus:ring-blue-500 transition-all">
                  <SelectValue placeholder="Papel" />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="z-[100] min-w-[200px] bg-white rounded-x shadow-xl border border-gray-100 animate-in fade-in-0 zoom-in-95"
                >
                  <SelectItem value="todos" className="cursor-pointer py-2.5 rounded-x focus:bg-blue-50 focus:text-blue-600">
                    Todos os papéis
                  </SelectItem>
                  <SelectItem value="admin" className="cursor-pointer py-2.5 rounded-lg focus:bg-blue-50 focus:text-blue-600">
                    Admin
                  </SelectItem>
                  <SelectItem value="instrutor" className="cursor-pointer py-2.5 rounded-lg focus:bg-blue-50 focus:text-blue-600">
                    Instrutor
                  </SelectItem>
                  <SelectItem value="aluno" className="cursor-pointer py-2.5 rounded-lg focus:bg-blue-50 focus:text-blue-600">
                    Aluno
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-3">
            <UserTable
              usuarios={paginados}
              onEdit={(u) => { setEditando(u); setNovoRole(u.role); }}
              onBan={setConfirmandoBan}
            />
          </CardContent>
        </Card>

      </main>
    </div>
  );
}