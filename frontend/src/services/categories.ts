const API_URL = "http://localhost:8000/api";

export async function getCategories() {
  const token = localStorage.getItem("access");

  const headers: Record<string, string> = {};
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/categories/`, {
    headers: headers,
  });

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar categorias");
  }

  return response.json();
}