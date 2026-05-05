"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cadastroInstrutorSchema } from "./schema";
import { toast } from "sonner";

export function useCadastroInstrutor() {
  const form = useForm({
    resolver: zodResolver(cadastroInstrutorSchema),
    defaultValues: {
      especialidade: "",
      bio: "",
      linkedin: "",
      portfolio: "",
      arquivo: null,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem("access");

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as any);
        }
      });

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await fetch("http://127.0.0.1:8000/api/instructor-requests/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      toast.success("Enviado com sucesso!");
      form.reset();
    } catch {
      toast.error("Erro ao enviar");
    }
  };

  return { form, onSubmit };
}