const API_URL = "http://localhost:8000/api";
import { CourseRecommendation } from "../types/course";

export async function getCourses(pageOrAll: number | boolean = 1) {
  const token = localStorage.getItem("access");

  const headers: Record<string, string> = {};
  
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = pageOrAll === true 
    ? `${API_URL}/courses/?all=true` 
    : `${API_URL}/courses/?page=${pageOrAll}`;

  const response = await fetch(url, { headers });

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar cursos");
  }

  return response.json();
}

export async function getMyCourses() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/courses/my_courses/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/entrar";
    return;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar cursos");
  }

  return data;
}

export async function getCourseDetail(courseId: number) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/courses/${courseId}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/entrar";
    return;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar curso");
  }

  return response.json();
}

export async function enrollInCourse(courseId: number) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/enrollments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      course: courseId,
    }),
  });

  const result = await response.json();

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/entrar";
    return;
  }

  if (!response.ok) {
    const errorMsg = Array.isArray(result) ? result[0] : result.detail || result[0];
    throw new Error(errorMsg || "Erro ao realizar matrícula");
  }

  return result;
}

export async function toggleCourseFavorite(courseId: number) {
  const token = localStorage.getItem("access");
  
  const response = await fetch(`${API_URL}/favorites/toggle/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ course: courseId }),
  });

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/entrar";
    return;
  }

  if (!response.ok) {
    throw new Error("Erro ao alternar favorito");
  }

  return response.json(); 
}

export async function completeLesson(lessonId: number): Promise<any> {
  const token = localStorage.getItem("access");

  if (!token) throw new Error("Usuário não autenticado");

  const response = await fetch(`${API_URL}/lessons/${lessonId}/complete/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/entrar";
    return;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao concluir a aula");
  }

  return response.json();
}

export async function getRecommendedCourses(): Promise<CourseRecommendation[]> {
  const token = localStorage.getItem("access");

  const headers: Record<string, string> = {};
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/courses/recommendations/`, {
    headers: headers,
  });

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json();
}