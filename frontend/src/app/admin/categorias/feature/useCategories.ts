"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface Categoria {
  id: string;
  name: string;
  icon?: string;
}

export function useCategories() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [iconeSelecionado, setIconeSelecionado] = useState("Code");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const pageSize = 10;

   async function fetchCategorias(page: number = 1) {
    try {
      setLoading(true);
      const response = await api.get<any>(`/categories/?page=${page}`);
      const dadosApi = response.data;

      if (Array.isArray(dadosApi)) {
        setCategorias(dadosApi);
        setTotalCount(dadosApi.length);
      } else if (dadosApi && Array.isArray(dadosApi.results)) {
        setCategorias(dadosApi.results);
        setTotalCount(dadosApi.count || dadosApi.results.length);
      } else {
        setCategorias([]);
      }
      setCurrentPage(page);
    } catch {
      toast.error("Erro ao carregar categorias.");
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategorias(1);
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchCategorias(page);
    }
  };

  const limparFormulario = () => {
    setNome("");
    setIconeSelecionado("Code");
  };

  const handleEditar = async (id: string, novoNome: string, novoIcone: string) => {
    try {
      setLoading(true);
      await api.patch(`/categories/${id}/`, {
        name: novoNome.trim(),
        icon: novoIcone,
      });
      toast.success("Categoria atualizada com sucesso!");
      fetchCategorias(currentPage);
    } catch (error: any) {
      const mensagemErro = error.response?.data?.name?.[0] || "Erro ao atualizar categoria.";
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/categories/", {
        name: nome.trim(),
        icon: iconeSelecionado,
      });

      toast.success(`Categoria "${nome.trim()}" cadastrada com sucesso!`);
      limparFormulario();
      fetchCategorias(1);
    } catch (error: any) {
      const mensagemErro = error.response?.data?.name?.[0] || "Erro ao salvar categoria.";
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = async (id: string) => {
    try {
      await api.delete(`/categories/${id}/`);
      toast.success("Categoria removida com sucesso.");
      fetchCategorias(currentPage);
    } catch {
      toast.error("Erro ao remover categoria.");
    }
  };

  return {
    categorias,
    loading,
    nome,
    setNome,
    iconeSelecionado,
    setIconeSelecionado,
    totalCount,
    currentPage,
    totalPages,
    handlePageChange,
    limparFormulario,
    handleSalvar,
    handleEditar,
    handleRemover,
  };
}