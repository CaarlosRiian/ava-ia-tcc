import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Solicitacao } from "@/data/solicitacoes";
import { api } from "@/services/api"; 

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
      setLoading(true);
      const res = await api.get("/instructor-requests/");
      
      const rawData = res.data;
      const dataArray = Array.isArray(rawData) ? rawData : (rawData?.results || []);

      const normalizado: Solicitacao[] = dataArray.map((item: any) => ({
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
        motivo_rejeicao: item.motivo_rejeicao,
      }));

      setSolicitacoes(normalizado);
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
      toast.error("Erro ao carregar solicitações");
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (
    id: number,
    status: "aprovado" | "rejeitado",
    motivo_rejeicao?: string
  ) => {
    try {
      const endpoint = status === "aprovado" ? "aprovar" : "rejeitar";
      
      const payload = status === "rejeitado" && motivo_rejeicao 
        ? { motivo_rejeicao } 
        : undefined;

      await api.post(`/instructor-requests/${id}/${endpoint}/`, payload);

      setSolicitacoes((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status, motivo_rejeicao: motivo_rejeicao ?? s.motivo_rejeicao }
            : s
        )
      );

      toast.success(
        status === "aprovado" ? "Aprovado com sucesso!" : "Rejeitado com sucesso!"
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error("Erro ao atualizar status");
    }
  };

  return {
    solicitacoes,
    loading,
    atualizarStatus,
  };
}