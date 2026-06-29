import { api } from "@/services/api"; 

export async function createMaterial(formData: FormData) {
  const response = await api.post("/materials/", formData);
  return response.data;
}