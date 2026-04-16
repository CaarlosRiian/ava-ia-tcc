import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StatsProps {
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

export function StatsCards({ pendentes, aprovados, rejeitados }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Pendentes", valor: pendentes, cor: "text-[#161B1D]" },
        { label: "Aprovados", valor: aprovados, cor: "text-green-500" },
        { label: "Rejeitados", valor: rejeitados, cor: "text-red-500" },
      ].map((item) => (
        <Card key={item.label} className="border-none shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold uppercase text-xs tracking-wider">{item.label}</CardDescription>
            <CardTitle className={`text-3xl font-black ${item.cor}`}>{item.valor}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}