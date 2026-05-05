import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Solicitacao } from "@/data/solicitacoes";

const mapStatus = (status: string): Solicitacao["status"] => {
  const map: Record<string, Solicitacao["status"]> = {
    pending: "pendente",
    approved: "aprovado",
    rejected: "rejeitado",
  };

  return map[status] ?? "pendente";
};

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        "http://127.0.0.1:8000/api/instructor-requests/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      
      const data = await res.json();
      console.log(data);

      const normalizado: Solicitacao[] = data.map((item: any) => ({
        id: item.id,
        nome: item.user?.username ?? "sem nome",
        user: item.user,
        email: "não disponível",
        especialidade: item.especialidade,
        bio: item.bio,
        linkedin: item.linkedin,
        portfolio: item.portfolio,
        documento: item.arquivo,
        status: mapStatus(item.status),
        dataEnvio: item.created_at,
      }));

      setSolicitacoes(normalizado);
    } catch {
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (
    id: number,
    status: "aprovado" | "rejeitado"
  ) => {
    try {
      const token = localStorage.getItem("access");

      const endpoint =
        status === "aprovado" ? "aprovar" : "rejeitar";

      const res = await fetch(
        `http://127.0.0.1:8000/api/instructor-requests/${id}/${endpoint}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      setSolicitacoes((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status } : s
        )
      );

      toast.success(
        status === "aprovado" ? "Aprovado!" : "Rejeitado!"
      );
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  return {
    solicitacoes,
    loading,
    atualizarStatus,
  };
}