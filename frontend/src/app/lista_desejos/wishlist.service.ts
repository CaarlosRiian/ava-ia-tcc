const API_URL = "http://127.0.0.1:8000/api";

export async function getWishlist(token: string) {
  const response = await fetch(`${API_URL}/wishlist/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar lista de desejos (${response.status})`);
  }

  return response.json();
}

export async function toggleWishlist(token: string, courseId: number) {
  const response = await fetch(`${API_URL}/wishlist/toggle/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ course: courseId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Erro ao atualizar lista de desejos (${response.status})`);
  }

  return response.json();
}