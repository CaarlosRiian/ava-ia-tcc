import { CheckCircle2 } from "lucide-react";

interface CourseAboutProps {
  description: string;
}

export default function CourseAbout({ description }: CourseAboutProps) {
  const benefits = [
    "Aulas práticas e objetivas",
    "Materiais complementares",
    "Assistente de IA para tirar dúvidas",
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-3">Sobre este curso</h2>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
        {benefits.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-black mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}