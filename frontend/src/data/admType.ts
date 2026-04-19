export type Role = "admin" | "instrutor" | "aluno";
export type Status = "ativo" | "banido";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  role: Role;
  status: Status;
  cadastradoEm: string;
}

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  instrutor: "Instrutor",
  aluno: "Aluno",
};

export const roleVariants: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  instrutor: "secondary",
  aluno: "outline",
};

export const mockUsuarios: Usuario[] = [
  { id: "1", nome: "Gustavo Guanabara", email: "gustavo@avaia.com", role: "instrutor", status: "ativo", cadastradoEm: "2024-01-15" },
  { id: "2", nome: "Ana Silva", email: "ana.silva@email.com", role: "aluno", status: "ativo", cadastradoEm: "2024-03-22" },
  { id: "3", nome: "Carlos Admin", email: "carlos@avaia.com", role: "admin", status: "ativo", cadastradoEm: "2023-11-02" },
  { id: "4", nome: "Bruno Costa", email: "bruno@email.com", role: "aluno", status: "banido", cadastradoEm: "2024-05-10" },
  { id: "5", nome: "Mariana Lopes", email: "mariana@email.com", role: "instrutor", status: "ativo", cadastradoEm: "2024-02-18" },
  { id: "6", nome: "João Pedro", email: "joao.pedro@email.com", role: "aluno", status: "ativo", cadastradoEm: "2024-06-01" },
  { id: "7", nome: "Letícia Rocha", email: "leticia@email.com", role: "aluno", status: "ativo", cadastradoEm: "2024-07-12" },
  { id: "8", nome: "Rafael Mendes", email: "rafael@email.com", role: "instrutor", status: "banido", cadastradoEm: "2024-04-08" },
  { id: "9", nome: "Patrícia Souza", email: "patricia@email.com", role: "aluno", status: "ativo", cadastradoEm: "2024-08-19" },
  { id: "10", nome: "Diego Martins", email: "diego@email.com", role: "aluno", status: "ativo", cadastradoEm: "2024-09-03" },
  { id: "11", nome: "Fernanda Lima", email: "fernanda@email.com", role: "instrutor", status: "ativo", cadastradoEm: "2024-01-30" },
  { id: "12", nome: "Tiago Almeida", email: "tiago@email.com", role: "aluno", status: "ativo", cadastradoEm: "2024-10-11" },
];