import { Users, Shield, GraduationCap, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserStatsProps {
  stats: { total: number; admins: number; instrutores: number; banidos: number };
}

export const UserStats = ({ stats }: UserStatsProps) => (
  <div className="grid gap-4 md:grid-cols-4 mb-6">
    <StatCard title="Total" value={stats.total} icon={Users} />
    <StatCard title="Admins" value={stats.admins} icon={Shield} />
    <StatCard title="Instrutores" value={stats.instrutores} icon={GraduationCap} />
    <StatCard title="Banidos" value={stats.banidos} icon={Ban} />
  </div>
);

const StatCard = ({ title, value, icon: Icon }: any) => (
  <Card className="bg-white">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);