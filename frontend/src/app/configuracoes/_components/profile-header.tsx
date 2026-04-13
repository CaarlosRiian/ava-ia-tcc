import { Camera } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileHeaderProps {
  name: string;
  email: string;
  initials: string;
}

export function ProfileHeader({ name, email, initials }: ProfileHeaderProps) {
  return (
    <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
      <CardContent className="flex items-center gap-6 pt-8 pb-8 bg-white">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-4 border-gray-50 shadow-md">
            <AvatarFallback className="text-2xl font-black bg-[#2F52E0] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#2F52E0] text-white hover:scale-110 cursor-pointer transition-transform shadow-lg">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#161B1D]">{name}</h2>
          <p className="text-gray-400">{email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-50 text-[#2F52E0] text-xs font-bold border border-blue-100">
            Conta Estudante
          </span>
        </div>
      </CardContent>
    </Card>
  );
}