import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileHeaderProps {
  name: string;
  email: string;
  initials: string;
  role?: string;
  birthDate?: string;
}

export function ProfileHeader({
  name,
  email,
  initials,
  role,
  birthDate,
}: ProfileHeaderProps) {
  const formatName = (value: string) => value?.replace(/_/g, " ") || "";

  const formatRole = (role?: string) => {
    if (!role) return "Usuário";
    switch (role) {
      case "aluno":
        return "Conta Estudante";
      case "professor":
        return "Instrutor";
      case "admin":
        return "Administrador";
      default:
        return role;
    }
  };

  const getAgeText = (dateString?: string) => {
    if (!dateString) return "Não informado";

    const birth = new Date(dateString);
    if (isNaN(birth.getTime())) return "Não informado";

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return `${age} anos`;
  };

  return (
    <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
      <CardContent className="flex items-center gap-6 pt-8 pb-8 bg-white">
        
        <Avatar className="h-24 w-24 border-4 border-gray-50 shadow-md">
          <AvatarFallback className="text-2xl font-black bg-[#FF7A00] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#161B1D]">
            {formatName(name)}
          </h2>

          <p className="text-[#64748B] text-sm font-medium">{email}</p>

          <div className="flex items-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF7A00] text-xs font-bold border border-gray-100">
              {formatRole(role)}
            </span>

            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
              {getAgeText(birthDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}