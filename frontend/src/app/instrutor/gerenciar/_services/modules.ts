import { getAccessToken } from "@/services/auth";

const API_URL = "http://127.0.0.1:8000/api";

export type CreateModuleDTO = {
    title: string;
    course: number;
    order: number;
};

export async function createModule(data: CreateModuleDTO) {
    const token = getAccessToken();

    const res = await fetch(`${API_URL}/modules/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        
    });

    if (!res.ok) {
        const errorData = await res.json();

        console.log("ERRO API:", errorData);

        throw new Error(JSON.stringify(errorData));
    }

    return res.json();
}

export async function updateModule(moduleId: string, data: { title: string }) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}/modules/${moduleId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(JSON.stringify(error));
  }

  return res.json();
}

export async function deleteModule(moduleId: string) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}/modules/${moduleId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(JSON.stringify(error));
  }

  return true;
}