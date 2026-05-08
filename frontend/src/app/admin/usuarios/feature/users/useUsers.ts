"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Usuario, Role, Status } from "@/data/admType";
import { getUsers } from "@/services/users";
import { api } from "@/services/api";

export function useUsers() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<Role | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<Status | "todos">("todos");
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);

  async function fetchUsuarios() {
    try {
      setLoading(true);

      const data = await getUsers({
        page: pagina,
        search: busca,
        role: filtroRole !== "todos" ? filtroRole : undefined,
        status: filtroStatus !== "todos" ? filtroStatus : undefined,
      });

      setUsuarios(data);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsuarios();
  }, [pagina, busca, filtroRole, filtroStatus]);

  async function handleChangeRole(user: Usuario, role: Role) {
    try {
      await api.patch(`/api/users/${user.id}/change_role/`, { role });

      toast.success("Papel atualizado!");
      fetchUsuarios();
    } catch {
      toast.error("Erro ao atualizar papel");
    }
  }

  async function handleBanUser(user: Usuario) {
    try {
      await api.patch(`/api/users/${user.id}/toggle_ban/`);

      toast.success(
        user.status === "ativo"
          ? "Usuário banido!"
          : "Usuário reativado!"
      );

      fetchUsuarios();
    } catch {
      toast.error("Erro ao atualizar usuário");
    }
  }

  const stats = useMemo(() => ({
    total: usuarios.length,
    admins: usuarios.filter((u) => u.role === "admin").length,
    professores: usuarios.filter((u) => u.role === "professor").length,
    banidos: usuarios.filter((u) => u.status === "banido").length,
  }), [usuarios]);

  return {
    usuarios,
    loading,

    busca,
    setBusca,

    filtroRole,
    setFiltroRole,

    filtroStatus,
    setFiltroStatus,

    pagina,
    setPagina,

    stats,

    handleChangeRole,
    handleBanUser,
    fetchUsuarios,
  };
}