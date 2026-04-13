import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface InstructorSectionProps {
  isProfessor: boolean;
  onToggle: (checked: boolean) => void;
}

export function InstructorSection({ isProfessor, onToggle }: InstructorSectionProps) {
  return (
    <Card className={`border-2 transition-all bg-white duration-300 rounded-[24px] ${isProfessor ? 'border-[#2F52E0] bg-blue-50/30' : 'border-transparent shadow-sm'}`}>
      <CardHeader>
        <CardTitle className="text-lg font-bold bg-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#2F52E0]" /> Área do Instrutor
        </CardTitle>
        <CardDescription className="text-gray-500">
          Compartilhe seu conhecimento e monetize suas aulas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between bg-white p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="space-y-1">
            <p className="font-bold text-[#161B1D]">Modo Professor</p>
            <p className="text-sm text-gray-400">
              {isProfessor ? "Seu painel de controle está sendo preparado." : "Ative para publicar cursos na plataforma."}
            </p>
          </div>
          <Switch checked={isProfessor} onCheckedChange={onToggle} className="data-[state=checked]:bg-[#2F52E0]" />
        </div>

        {isProfessor && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2  duration-500">
            <div className="bg-[#2F52E0] text-white p-4 rounded-2xl shadow-lg shadow-blue-200/50">
              <p className="text-sm font-black mb-1">Quase pronto, Professor!</p>
              <p className="text-xs opacity-90">
                Estamos configurando suas ferramentas de upload de vídeo e o sistema de quizzes com IA.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}