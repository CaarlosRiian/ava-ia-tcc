const API_URL = "http://localhost:8000/api";

export async function getCategories(all: boolean = false) {
  const token = localStorage.getItem("access");

  const headers: Record<string, string> = {};
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = all ? `${API_URL}/categories/?all=true` : `${API_URL}/categories/`;

  const response = await fetch(url, {
    headers: headers,
  });

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar categorias");
  }

  const data = await response.json();

  return data.results || data;
}