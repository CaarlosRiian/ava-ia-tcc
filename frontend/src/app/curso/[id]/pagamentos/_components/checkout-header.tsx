"use client";

import Link from "next/link"; 
import { ArrowLeft } from "lucide-react";

interface CheckoutHeaderProps {
  courseId: string | number;
}

export default function CheckoutHeader({ courseId }: CheckoutHeaderProps) {
  return (
    <>
      <Link
        href={`/curso/${courseId}`} 
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o curso
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Finalize sua Inscrição</h1>
        <p className="text-muted-foreground mt-2">
          Escolha a forma de pagamento abaixo. Após a confirmação, sua matrícula
          será realizada automaticamente e você terá acesso imediato ao curso.
        </p>
      </div>
    </>
  );
}