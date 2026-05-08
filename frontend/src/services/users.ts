import { api } from "@/services/api";
import { Usuario } from "@/data/admType";

function mapUser(u: any): Usuario {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    avatar_url: u.avatar_url,
  };
}

export async function getUsers(params: {
  page?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const res = await api.get("/api/users/", { params });

  const data = res.data.results ?? res.data ?? [];

  return data.map(mapUser);
}