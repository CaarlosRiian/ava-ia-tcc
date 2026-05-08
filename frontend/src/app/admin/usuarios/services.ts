import { api } from "@/services/api";

export async function getUsers(params: {
  page?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const res = await api.get("/api/users/", { params });

  const data = res.data.results ?? res.data;

  return data.map((u: any) => ({
    id: u.id,
    nome: u.username,
    email: u.email,
    role: u.role,
    status: u.status,
    cadastradoEm: u.created_at,
    avatar: u.avatar_url,
  }));
}