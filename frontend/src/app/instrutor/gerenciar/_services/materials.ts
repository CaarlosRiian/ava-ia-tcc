import { api } from "@/services/api"; 

export async function createMaterial(payload: { lesson: string; title: string; material_type: string; raw_content: string | null }) {
  const response = await api.post("/materials/", payload);
  return response.data;
}