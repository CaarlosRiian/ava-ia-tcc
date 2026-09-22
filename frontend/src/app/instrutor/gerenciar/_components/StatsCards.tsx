import { Card, CardContent } from "@/components/ui/card";

interface Props {
  cursosCount: number;
  aulasCount: number;
  alunosCount: number;
}

export const StatsCards = ({ cursosCount, aulasCount, alunosCount }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {[
      { label: "Meus Cursos", val: cursosCount },
      { label: "Total de Aulas", val: aulasCount },
      { label: "Total de Alunos", val: alunosCount.toLocaleString("pt-BR") }
    ].map((item, i) => (
      <Card key={i} className="shadow-sm border-none bg-white">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
          <p className="text-xl font-bold text-[#FF7A00] mt-1">{item.val}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);