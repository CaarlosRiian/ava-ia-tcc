export async function createLesson(data: FormData) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: data,
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar aula");
  }

  return response.json();
}

export async function updateLesson(
  lessonId: string,
  data: FormData
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: data,
    }
  );

  if (!response.ok) {
    let error;

    try {
      error = await response.json();
    } catch {
      error = { message: "Erro ao atualizar aula" };
    }

    throw new Error(JSON.stringify(error));
  }

  return response.json();
}

export async function deleteLesson(lessonId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    }
  );

  if (!response.ok) {
    let error;

    try {
      error = await response.json();
    } catch {
      error = { message: "Erro ao deletar aula" };
    }

    throw new Error(JSON.stringify(error));
  }

  return true;
}