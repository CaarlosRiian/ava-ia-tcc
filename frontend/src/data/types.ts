export interface AulaGerenciada {
  id: string;
  titulo: string;
  duracao: string;
  status: "publicada" | "rascunho";
}

export interface CursoGerenciado {
  id: string;
  titulo: string;
  categoria: string;
  alunos: number;
  aulas: AulaGerenciada[];
}

export const mockCursosGerenciados: CursoGerenciado[] = [
  {
    id: "1",
    titulo: "Curso Completo de HTML5 e CSS3",
    categoria: "Desenvolvimento",
    alunos: 1240,
    aulas: [
      { id: "1-1", titulo: "Introdução ao HTML5", duracao: "15:30", status: "publicada" },
      { id: "1-2", titulo: "Estrutura básica de uma página", duracao: "22:10", status: "publicada" },
    ],
  },
  {
    id: "2",
    titulo: "JavaScript Moderno - ES6+",
    categoria: "Desenvolvimento",
    alunos: 890,
    aulas: [
      { id: "2-1", titulo: "Variáveis let e const", duracao: "12:00", status: "publicada" },
    ],
  },
];