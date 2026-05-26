const API_URL = "http://localhost:8000/api";

export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export async function registerUser(data: RegisterData) {
  const response = await fetch(`${API_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  console.log("REGISTER RESPONSE:", result);

  if (!response.ok) {
    throw new Error(result?.detail || "Erro ao criar usuário");
  }

  return result;
}

export async function loginUser(data: LoginData) {
  const response = await fetch(`${API_URL}/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.detail || "Credenciais inválidas");
  }

  saveTokens(result.access, result.refresh);

  return result;
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/me/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.detail || "Erro ao buscar usuário");
  }

  return result;
}

export function getAccessToken() {
  return localStorage.getItem("access");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh");
}

export async function updateMe(token: string, profileData: any) {
  const response = await fetch(`${API_URL}/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.detail || JSON.stringify(result) || "Erro ao atualizar dados do perfil");
  }

  return result;
}