import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl border-gray-200 text-xs font-semibold h-10 px-4 cursor-pointer disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
      </Button>

      <span className="text-xs font-bold text-gray-600 px-2">
        Página <span className="text-[#FF7A00]">{currentPage}</span> de {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl border-gray-200 text-xs font-semibold h-10 px-4 cursor-pointer disabled:opacity-40"
      >
        Próxima <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}