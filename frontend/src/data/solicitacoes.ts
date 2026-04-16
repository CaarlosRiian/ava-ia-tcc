export interface Solicitacao {
  id: string;
  nome: string;
  email: string;
  especialidade: string;
  bio: string;
  linkedin?: string;
  portfolio?: string;
  documento?: string;
  status: "pendente" | "aprovado" | "rejeitado";
  dataEnvio: string;
}

export const mockSolicitacoes: Solicitacao[] = [
  {
    id: "1",
    nome: "Carlos Eduardo",
    email: "carlos@email.com",
    especialidade: "Programação",
    bio: "Desenvolvedor full-stack com 5 anos de experiência em React e Node.js.",
    status: "pendente",
    dataEnvio: "2026-04-14",
  },
];