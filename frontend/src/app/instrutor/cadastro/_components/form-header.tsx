import { GraduationCap } from "lucide-react";

export function FormHeader() {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto w-16 h-16 rounded-3xl bg-[#2F52E0] flex items-center justify-center shadow-lg shadow-[#2F52E0]/20">
        <GraduationCap className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-4xl font-black text-[#161B1D] tracking-tight">Torne-se um Instrutor</h1>
      <p className="text-gray-500 font-medium">
        Sua jornada para impactar alunos através da IA começa aqui.
      </p>
    </div>
  );
}