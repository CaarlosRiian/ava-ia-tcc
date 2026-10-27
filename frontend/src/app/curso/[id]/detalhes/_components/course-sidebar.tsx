"use client";

import { useRouter } from "next/navigation";
import { Clock, Award, Infinity as InfinityIcon, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseSidebarProps {
  course: {
    id: string | number;
    price?: string | number; 
    hours?: number;
    modules?: any[]; 
  };
  isInWishlist?: boolean;
  onToggleWishlist?: () => void;
}

export default function CourseSidebar({ course, isInWishlist = false, onToggleWishlist }: CourseSidebarProps) {
  const router = useRouter();

  const priceNumber = Number(course.price) || 197.0;
  const formattedPrice = priceNumber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const totalLessons = course.modules?.reduce((acc: number, mod: any) => {
    const lessonsCount = mod.lessons?.length || mod.lessons_count || 0;
    return acc + lessonsCount;
  }, 0) || 0;

  const handleAcquire = () => {
    const token = localStorage.getItem("access");

    if (!token) {
      router.push(`/login?redirect=/curso/${course.id}/pagamentos`);
    } else {
      router.push(`/curso/${course.id}/pagamentos`);
    }
  };

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-6 sticky top-20 space-y-4">
      <div className="mb-2">
        <p className="text-3xl font-bold mt-1">{formattedPrice}</p>
        <p className="text-xs text-muted-foreground mt-1">ou em até 12x no cartão</p>
      </div>

      <div className="space-y-2.5">
        <Button 
          size="lg" 
          onClick={handleAcquire}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer h-12 rounded-xl" 
        >
          Adquirir Curso
        </Button>

        {onToggleWishlist && (
          <Button 
            size="lg"
            variant="outline"
            onClick={onToggleWishlist}
            className={`w-full h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all hover:bg-gray-100 hover:border-red-500 cursor-pointer ${
              isInWishlist
                ? "!bg-red-50 !border-red-200 text-red-600 hover:!bg-red-100"
                : "!bg-white !border-zinc-300 text-zinc-900 hover:!bg-zinc-100"
            }`}
          >
            <Heart 
              className={`h-4 w-4 transition-transform ${isInWishlist ? "fill-red-600 text-red-600 scale-110" : "text-zinc-700"}`} 
            />
            <span>{isInWishlist ? "Na Lista de Desejos" : "Adicionar aos Desejos"}</span>
          </Button>
        )}
      </div>

      <ul className="mt-6 space-y-3 text-sm pt-4 border-t border-zinc-100">
        <li className="flex items-center gap-3">
        <Award className="h-4 w-4 text-black" />
        <span>Certificado de conclusão</span>
        </li>

        <li className="flex items-center gap-3">
          <InfinityIcon className="h-4 w-4 text-black" />
          <span>Acesso vitalício ao conteúdo</span>
        </li>

        <li className="flex items-center gap-3">
          <BookOpen className="h-4 w-4 text-black" />
          <span>{totalLessons} {totalLessons === 1 ? 'aula' : 'aulas'} em vídeo</span>
        </li>
      </ul>
    </div>
  );
}