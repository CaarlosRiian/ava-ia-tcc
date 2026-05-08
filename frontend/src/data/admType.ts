export type Role = "admin" | "professor" | "aluno";

export type Status = "ativo" | "banido";

export interface Usuario {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  role: Role;
  status: Status;
  created_at: string;
}

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  professor: "Professor",
  aluno: "Aluno",
};

export const roleVariants: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  professor: "secondary",
  aluno: "outline",
};