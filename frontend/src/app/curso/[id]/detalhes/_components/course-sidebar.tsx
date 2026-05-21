"use client";

import { useRouter } from "next/navigation";
import { Clock, Award, Infinity as InfinityIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseSidebarProps {
  course: {
    id: string | number;
    price?: string | number; 
    hours?: number;
    modules?: any[]; 
  };
}

export default function CourseSidebar({ course }: CourseSidebarProps) {
  const router = useRouter();

  const priceNumber = Number(course.price) || 197.0;
  const formattedPrice = priceNumber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const totalHours = course.hours || 40;

  const totalLessons = course.modules?.reduce((acc: number, mod: any) => {
    const lessonsCount = mod.lessons?.length || mod.lessons_count || 0;
    return acc + lessonsCount;
  }, 0) || 0;

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-6 sticky top-20">
      <div className="mb-5">
        <p className="text-3xl font-bold mt-1">{formattedPrice}</p>
        <p className="text-xs text-muted-foreground mt-1">ou em até 12x no cartão</p>
      </div>

      <Button 
        size="lg" 
        onClick={() => router.push(`/curso/${course.id}/detalhe/pagamento`)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer" 
      >
        Adquirir Curso (Simulação)
      </Button>

      <ul className="mt-6 space-y-3 text-sm">
        <li className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary" />
          <span>
            <strong>{totalHours}h</strong> de carga horária
          </span>
        </li>
        <li className="flex items-center gap-3">
          <Award className="h-4 w-4 text-primary" />
          <span>Certificado de conclusão</span>
        </li>
        <li className="flex items-center gap-3">
          <InfinityIcon className="h-4 w-4 text-primary" />
          <span>Acesso vitalício ao conteúdo</span>
        </li>
        <li className="flex items-center gap-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>{totalLessons} {totalLessons === 1 ? 'aula' : 'aulas'} em vídeo</span>
        </li>
      </ul>
    </div>
  );
}