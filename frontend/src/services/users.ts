import { api } from "@/services/api";
import { Usuario } from "@/data/admType";

export async function getUsers(params: {
  page?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<{ results: Usuario[]; totalCount: number }> { 
  const res = await api.get("/users/", { params });

  const results = res.data.results ?? res.data;
  const totalCount = res.data.count ?? results.length;

  const usuariosMapeados = results.map((u: any) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    avatar_url: u.avatar_url,
  }));

  return { results: usuariosMapeados, totalCount };
}