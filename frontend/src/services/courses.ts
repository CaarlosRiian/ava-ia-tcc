const API_URL = "http://localhost:8000/api";

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
    window.location.href = "/login";
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
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar curso");
  }

  return response.json();
}