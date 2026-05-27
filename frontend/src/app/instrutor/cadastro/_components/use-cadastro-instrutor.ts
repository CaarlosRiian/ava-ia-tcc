"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/services/api";

interface Categoria {
  id: string;
  name: string;
}

const cadastroInstrutorSchema = z.object({
  especialidade: z.string().min(1, "Selecione uma área de especialidade."),
  bio: z.string().min(15, "A sua bio profissional deve conter ao menos 15 caracteres."),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  arquivo: z.any().refine((file) => file instanceof File, "O upload do currículo/documento é obrigatório."),
  termos: z.boolean().refine((val) => val === true, "Você precisa aceitar os termos para prosseguir."),
});

type CadastroInstrutorFormData = z.infer<typeof cadastroInstrutorSchema>;

export function useCadastroInstrutor() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const defaultValues = {
    especialidade: "",
    bio: "",
    linkedin: "",
    portfolio: "",
    arquivo: null,
    termos: false,
  };

  const form = useForm<CadastroInstrutorFormData>({
    resolver: zodResolver(cadastroInstrutorSchema),
    defaultValues,
  });

  async function fetchCategorias() {
    try {
      setLoadingCategorias(true);
      const response = await api.get<Categoria[]>("/categories/");
      setCategorias(response.data);
    } catch {
      toast.error("Erro ao carregar as especialidades disponíveis.");
    } finally {
      setLoadingCategorias(false);
    }
  }

  useEffect(() => {
    fetchCategorias();
  }, []);

  const onSubmit = async (data: CadastroInstrutorFormData) => {
    try {
      const formData = new FormData();

      formData.append("especialidade", data.especialidade);
      formData.append("bio", data.bio);

      if (data.linkedin) formData.append("linkedin", data.linkedin);
      if (data.portfolio) formData.append("portfolio", data.portfolio);

      if (data.arquivo) formData.append("arquivo", data.arquivo);

      await api.post("/instructor-requests/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Sua solicitação de cadastro foi enviada!");
      form.reset(defaultValues);

    } catch (error: any) {
      toast.error("Erro ao enviar formulário.");
    }
  };

  return {
    form,
    onSubmit,
    categorias,
    loadingCategorias,
  };
}