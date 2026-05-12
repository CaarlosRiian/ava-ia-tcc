import { getAccessToken } from "@/services/auth";

const API_URL = "http://127.0.0.1:8000/api";

export async function getCourses() {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}/courses/instructor_dashboard/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function createCourse(formData: FormData) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}/courses/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Erro ao criar curso");

  return res.json();
}

export async function updateCourse(
  courseId: string,
  formData: FormData
) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}/courses/${courseId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar curso");
  }

  return res.json();
}

export async function deleteCourse(courseId: string) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}/courses/${courseId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erro ao deletar curso");
  }

  return true;
}