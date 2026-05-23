export type Lesson = {
  id: string;
  title: string;

  module: string;
  status: "rascunho" | "publicada";
  visibility: "publico" | "privado";
  duration?: string;
  duration_seconds?: number;
  thumbnail?: string | null;
  video?: string | null;
};

export type Module = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

export type CourseAPI = {
  id: string;
  title: string;
  description?: string;
  category?: string | { id: string; name: string };
  price?: number | number;
  thumbnail?: string | null
  alunos: number;
  modules: Module[];
};

export type CourseUI = CourseAPI & {
  aulas: Lesson[];
};

export type Category = {
  id: string;
  name: string;
};