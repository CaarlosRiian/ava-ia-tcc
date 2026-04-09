export interface Lesson {
  id: string;
  title: string;
  duration: string;
}

export interface Course {
  id: number;
  title: string;
  author: string;
  hours: number;
  category: string;
  description: string;
  lessons: Lesson[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "dev", label: "Desenvolvimento", icon: "💻" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "ia", label: "IA & Dados", icon: "🤖" },
];

export const mockCourses: Course[] = [
  { 
    id: 1, 
    title: "Next.js 15 Completo", 
    author: "Rian Linarez", 
    hours: 12, 
    category: "dev",
    description: "Domine o framework mais popular do React com as novas funcionalidades do App Router e Server Actions.",
    lessons: [
      { id: "l1", title: "Introdução ao Next.js 15", duration: "08:30" },
      { id: "l2", title: "Configurando o ambiente", duration: "12:00" },
      { id: "l3", title: "Server Components vs Client Components", duration: "25:15" },
    ]
  },
  { 
    id: 2, 
    title: "UI Design para TCC", 
    author: "Ana Silva", 
    hours: 8, 
    category: "design",
    description: "Aprenda a criar interfaces modernas e funcionais para o seu trabalho de conclusão de curso.",
    lessons: [
      { id: "l1", title: "Princípios do Design", duration: "15:00" },
      { id: "l2", title: "Cores e Tipografia", duration: "20:00" },
    ]
  },
  { 
    id: 3, 
    title: "Prompt Engineering", 
    author: "IA Master", 
    hours: 5, 
    category: "ia",
    description: "A arte de conversar com modelos de linguagem para obter resultados profissionais.",
    lessons: [
      { id: "l1", title: "O que são Prompts?", duration: "05:00" },
      { id: "l2", title: "Técnica Few-Shot", duration: "12:00" },
    ]
  },
  { 
    id: 4, 
    title: "Tailwind CSS Pro", 
    author: "Rian Linarez", 
    hours: 10, 
    category: "dev",
    description: "Estilize suas aplicações com velocidade e performance usando utilitários CSS.",
    lessons: [
      { id: "l1", title: "Configurando Tailwind", duration: "07:00" },
      { id: "l2", title: "Responsividade na prática", duration: "18:00" },
    ]
  },
];