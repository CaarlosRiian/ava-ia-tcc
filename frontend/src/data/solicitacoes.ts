export interface Solicitacao {
  id: number;
  nome: string;
  user: number;
  email: string;
  especialidade: string;
  bio: string;
  linkedin?: string;
  portfolio?: string;
  documento?: string;
  status: "pendente" | "aprovado" | "rejeitado";
  dataEnvio: string;
  motivo_rejeicao?: string; 
}

