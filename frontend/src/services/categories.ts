const API_URL = "http://localhost:8000/api";

export async function getCategories() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/categories/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar categorias");
  }

  return response.json();
}