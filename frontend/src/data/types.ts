export interface AulaGerenciada {
  id: string;
  title: string;
  duracao: string;
  status: "publicada" | "rascunho";
}

export interface ModuloGerenciado {
  id: string;
  title: string;
  lessons: AulaGerenciada[];
}
export interface CursoGerenciado {
  id: string;
  title: string;
  categoria: string;
  description: string;
  alunos: number;
  modules: ModuloGerenciado[];
}