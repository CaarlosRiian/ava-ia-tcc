export type Lesson = {
  id: string;
  title: string;
  status?: string;
  duration?: string;
};

export type Module = {
  id: string;
  title: string;
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