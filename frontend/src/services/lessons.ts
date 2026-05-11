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