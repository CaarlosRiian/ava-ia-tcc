import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserPaginationProps {
  paginaAtual: number;
  totalItens: number;
  itensPorPagina?: number;
  onPageChange: (pagina: number) => void;
}

export function UserPagination({
  paginaAtual,
  totalItens,
  itensPorPagina = 8,
  onPageChange,
}: UserPaginationProps) {
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);

  if (totalItens <= itensPorPagina) return null;

  return (
    <div className="py-4 border-t border-gray-100 bg-white">
      <Pagination>
        <PaginationContent className="flex items-center justify-center gap-1 select-none">
          
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                paginaAtual === 1 ? "opacity-40 pointer-events-none" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.max(1, paginaAtual - 1));
              }}
            />
          </PaginationItem>

          {Array.from({ length: totalPaginas }).map((_, i) => {
            const numeroPagina = i + 1;
            return (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={paginaAtual === numeroPagina}
                  className={`cursor-pointer transition-all rounded-lg text-xs font-bold ${
                    paginaAtual === numeroPagina
                      ? "bg-[#FF7A00] text-white hover:bg-[#ea7306] hover:text-white"
                      : "text-gray-600 hover:bg-gray-50 border-transparent"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(numeroPagina);
                  }}
                >
                  {numeroPagina}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                paginaAtual >= totalPaginas ? "opacity-40 pointer-events-none" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.min(totalPaginas, paginaAtual + 1));
              }}
            />
          </PaginationItem>

        </PaginationContent>
      </Pagination>
    </div>
  );
}