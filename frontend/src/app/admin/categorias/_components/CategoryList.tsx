"use client";

import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryItem } from "./CategoryItem";

interface Categoria {
  id: string;
  name: string;
  avatar_url?: string;
}

interface CategoryListProps {
  categorias: Categoria[];
  loading: boolean;
  handleRemover: (id: string) => void;
  handleEditar: (id: string, novoNome: string, novoArquivo?: File | null) => Promise<void>;
}

export function CategoryList({ categorias, loading, handleRemover, handleEditar }: CategoryListProps) {
  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="p-5 border-b border-gray-50">
        <CardTitle className="text-base font-bold">Categorias Ativas</CardTitle>
        <CardDescription className="text-xs">
          {categorias.length} {categorias.length === 1 ? "categoria mapeada" : "categorias mapeadas"} no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 bg-white">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 font-medium">
            Carregando categorias mapeadas...
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ImageIcon className="h-9 w-9 mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-medium">Nenhuma categoria encontrada no servidor.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {categorias.map((c) => (
              <CategoryItem 
                key={c.id} 
                categoria={c} 
                handleRemover={handleRemover} 
                handleEditar={handleEditar} 
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}