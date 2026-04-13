export const mockProfessors: Record<string, { name: string; bio: string; specialties: string[] }> = {
  "gustavo-guanabara": {
    name: "Gustavo Guanabara",
    bio: "Professor de tecnologia com mais de 20 anos de experiência. Criador de conteúdo educacional focado em programação web e desenvolvimento de software.",
    specialties: ["HTML5", "CSS3", "JavaScript", "PHP"],
  },
  "ana-designer": {
    name: "Ana Designer",
    bio: "Designer de interfaces com mais de 10 anos de experiência in UX/UI para produtos digitais.",
    specialties: ["UI Design", "UX Research", "Figma"],
  },
  "rian-linarez": {
    name: "Rian Linarez",
    bio: "Desenvolvedor Full Stack especializado em Next.js e Inteligência Artificial aplicada à educação.",
    specialties: ["Next.js 15", "React Native", "Spring Boot"],
  },
};

export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}