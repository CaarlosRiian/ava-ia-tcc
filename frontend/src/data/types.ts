export interface AulaGerenciada {
  id: number;
  title: string;
  duracao: string;
  status: "publicada" | "rascunho";
}

export interface ModuloGerenciado {
  id: number;
  title: string;
  lessons: AulaGerenciada[];
}

export interface CursoGerenciado {
  id: number;
  title: string;
  categoria: string;
  description: string;
  alunos: number;
  modules: ModuloGerenciado[];
}