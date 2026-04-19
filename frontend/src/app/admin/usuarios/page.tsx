"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";

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
  const totalPaginas = Math.ceil(filtrados.length / PAGE_SIZE);

  const salvarRole = () => {
    if (!editando) return;
    setUsuarios(prev => prev.map(u => u.id === editando.id ? { ...u, role: novoRole } : u));
    toast.success(`Papel de ${editando.nome} atualizado.`);
    setEditando(null);
  };

  const toggleBan = () => {
    if (!confirmandoBan) return;
    const novoStatus: Status = confirmandoBan.status === "ativo" ? "banido" : "ativo";
    setUsuarios(prev => prev.map(u => u.id === confirmandoBan.id ? { ...u, status: novoStatus } : u));
    toast.success(`${confirmandoBan.nome} ${novoStatus === "banido" ? 'banido' : 'reativado'}.`);
    setConfirmandoBan(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-black">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground mt-1">Controle de papéis e permissões.</p>
      </header>

      <UserStats stats={stats} />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
            </div>
            <Select value={filtroRole} onValueChange={(v) => setFiltroRole(v as Role | "todos")}>
              <SelectTrigger className="md:w-[180px]"><SelectValue placeholder="Papel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instrutor">Instrutor</SelectItem>
                <SelectItem value="aluno">Aluno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <UserTable usuarios={paginados} onEdit={(u) => { setEditando(u); setNovoRole(u.role); }} onBan={setConfirmandoBan} />
        </CardContent>
      </Card>
    </div>
  );
}