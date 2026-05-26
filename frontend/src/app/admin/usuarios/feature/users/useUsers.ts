"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Usuario, Role, Status } from "@/data/admType";
import { getUsers } from "@/services/users";
import { api } from "@/services/api";

export function useUsers() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0); 
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<Role | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<Status | "todos">("todos");
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPagina(1);
  }, [busca, filtroRole, filtroStatus]);

  async function fetchUsuarios() {
    try {
      setLoading(true);

      const data = await getUsers({
        page: pagina,
        search: busca,
        role: filtroRole !== "todos" ? filtroRole : undefined,
        status: filtroStatus !== "todos" ? filtroStatus : undefined,
      });

      setUsuarios(data.results);         
      setTotalUsuarios(data.totalCount); 
      
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
      await api.patch(`/users/${user.id}/change_role/`, { role });

      const nomeExibicao = user.username || "Usuário";
      toast.success(`Papel de ${nomeExibicao} atualizado para ${role}!`);
      
      fetchUsuarios();
    } catch {
      const nomeExibicao = user.username || "do usuário";
      toast.error(`Erro ao atualizar papel de ${nomeExibicao}`);
    }
  }

  async function handleBanUser(user: Usuario) {
    try {
      await api.patch(`/users/${user.id}/toggle_ban/`);

      const nomeExibicao = user.username || "Usuário";
      
      if (user.status === "ativo") {
        toast.success(`${nomeExibicao} foi banido com sucesso!`);
      } else {
        toast.success(`O acesso de ${nomeExibicao} foi restaurado.`);
      }

      fetchUsuarios();
    } catch {
      toast.error("Erro ao alterar o status do usuário");
    }
  }

  const stats = useMemo(() => ({
    total: totalUsuarios, 
    admins: usuarios.filter((u) => u.role === "admin").length,
    professores: usuarios.filter((u) => u.role === "professor").length,
    banidos: usuarios.filter((u) => u.status === "banido").length,
  }), [usuarios, totalUsuarios]);

  const ITENS_POR_PAGINA = 10; 
  const temProximaPagina = pagina * ITENS_POR_PAGINA < totalUsuarios;
  const temPaginaAnterior = pagina > 1;

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
    temProximaPagina,  
    temPaginaAnterior, 

    handleChangeRole,
    handleBanUser,
    fetchUsuarios,
  };
}