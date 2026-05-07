const API_URL = "http://127.0.0.1:8000/api";

export async function getFavorites(token: string) {
  const response = await fetch(`${API_URL}/favorites/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar favoritos (${response.status})`);
  }

  return response.json();
}

export async function toggleFavorite(token: string, courseId: number) {
  const response = await fetch(`${API_URL}/favorites/toggle/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ course: courseId }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar favorito (${response.status})`);
  }

  return response.json();
}