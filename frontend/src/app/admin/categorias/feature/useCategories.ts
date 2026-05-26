"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface Categoria {
  id: string;
  name: string;
  avatar_url?: string;
}

export function useCategories() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | undefined>(undefined);
  const [arquivoReal, setArquivoReal] = useState<File | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Buscar categorias do Back-end Django
  async function fetchCategorias() {
    try {
      setLoading(true);
      const response = await api.get<Categoria[]>("/categories/");
      setCategorias(response.data);
    } catch {
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategorias();
  }, []);

  // 2. Processar arquivo para Preview e validação
  const handleArquivo = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 4MB.");
      return;
    }

    setArquivoReal(file);
    setNomeArquivo(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagemPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const limparFormulario = () => {
    setNome("");
    setImagemPreview(undefined);
    setArquivoReal(null);
    setNomeArquivo("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleEditar = async (id: string, novoNome: string, novoArquivo?: File | null) => {
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", novoNome.trim());

    // Se o usuário escolheu uma nova imagem na edição, adiciona ela ao FormData
    if (novoArquivo) {
      formData.append("avatar_url", novoArquivo);
    }

    // Enviando via PATCH para atualizar parcialmente os dados no Django
    await api.patch(`/categories/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Categoria atualizada com sucesso!");
    fetchCategorias(); // Recarrega a lista atualizada do banco
  } catch (error: any) {
    console.log("ERRO AO EDITAR NO DJANGO:", error.response?.data);
    const mensagemErro = error.response?.data?.name?.[0] || "Erro ao atualizar categoria.";
    toast.error(mensagemErro);
  } finally {
    setLoading(false);
  }
};

  // 3. Salvar Categoria enviando o Arquivo Real via FormData na chave avatar_url
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    if (!arquivoReal) {
      toast.error("Adicione uma imagem para a categoria.");
      return;
    }

    try {
      setLoading(true);

      // 🌟 Usando FormData para enviar o arquivo binário real
      const formData = new FormData();
      formData.append("name", nome.trim());
      
      // 🌟 Chave correta (avatar_url) + Arquivo real (arquivoReal)
      formData.append("avatar_url", arquivoReal); 

      await api.post("/categories/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Categoria "${nome.trim()}" cadastrada com sucesso!`);
      limparFormulario();
      fetchCategorias();
    } catch (error: any) {
      console.log("ERRO DETALHADO DO DJANGO:", error.response?.data);
      
      const mensagemErro = 
        error.response?.data?.avatar_url?.[0] || 
        error.response?.data?.name?.[0] || 
        "Erro ao salvar categoria.";
        
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  // 4. Remover Categoria do Banco
  const handleRemover = async (id: string) => {
    try {
      await api.delete(`/categories/${id}/`);
      toast.success("Categoria removida com sucesso.");
      fetchCategorias();
    } catch {
      toast.error("Erro ao remover categoria.");
    }
  };

  return {
    categorias,
    loading,
    nome,
    setNome,
    imagemPreview,
    nomeArquivo,
    inputRef,
    handleArquivo,
    limparFormulario,
    handleSalvar,
    handleEditar,
    handleRemover,
  };
}