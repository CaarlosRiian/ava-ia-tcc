import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

type Status = "pendente" | "aprovado" | "rejeitado";

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pendente: "border-yellow-500 text-yellow-500",
    aprovado: "border-green-500 text-green-500",
    rejeitado: "border-red-500 text-red-500",
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {status === "pendente" && <Clock className="h-4 w-4 mr-1" />}
      {status}
    </Badge>
  );
}