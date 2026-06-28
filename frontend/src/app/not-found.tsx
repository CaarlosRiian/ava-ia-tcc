"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.error("404 - Rota não encontrada:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative">
            <h1 className="text-9xl font-black text-gray-200 select-none">404</h1>
            <p className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 mt-8">
              Página não encontrada
            </p>
          </div>

          <p className="text-muted-foreground text-lg">
            Me desculpe, a página <code className="bg-gray-100 px-1 rounded text-red-500">{pathname}</code> não existe ou foi movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button 
              variant="outline" 
              className="rounded-xl cursor-pointer p-5"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <Button asChild className="rounded-x bg-blue-600 hover:bg-blue-700 cursor-pointer p-5">
              <Link href="/descobrir">
                <Home className="mr-2 h-4 w-4" />
                Ir para o Início
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}