"use client";

import { FolderTree } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryItem } from "./CategoryItem";
import { Pagination } from "@/components/Pagination";

interface Categoria {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryListProps {
  categorias: Categoria[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  handleRemover: (id: string) => void;
  handleEditar: (id: string, novoNome: string, novoIcone: string) => Promise<void>;
}

export function CategoryList({ 
  categorias, 
  loading, 
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  handleRemover, 
  handleEditar 
}: CategoryListProps) {
  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden flex flex-col">
      <CardHeader className="p-5 border-b border-gray-50">
        <CardTitle className="text-base font-bold">Categorias Ativas</CardTitle>
        <CardDescription className="text-xs">
          {totalCount} {totalCount === 1 ? "categoria mapeada" : "categorias mapeadas"} no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 bg-white flex-1 flex flex-col justify-between">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 font-medium">
            Carregando categorias mapeadas...
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FolderTree className="h-9 w-9 mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-medium">Nenhuma categoria encontrada no servidor.</p>
          </div>
        ) : (
          <div className="space-y-4">
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}