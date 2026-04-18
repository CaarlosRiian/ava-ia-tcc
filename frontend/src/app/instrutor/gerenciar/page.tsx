"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/Header"; 
import { CourseCard } from "./_components/CourseCard-Item";
import { StatsCards } from "./_components/StatsCards";
import { LessonManager } from "./_components/LessonManager";
import { CursoGerenciado, mockCursosGerenciados } from "@/data/types";

export default function GerenciamentoAulas() {
  const [cursos, setCursos] = useState<CursoGerenciado[]>(mockCursosGerenciados);
  const [cursoSelecionado, setCursoSelecionado] = useState<string | null>(null);

  const cursoAtivo = cursos.find((c) => c.id === cursoSelecionado);

  const handleToggle = (cId: string, aId: string) => {
    setCursos(prev => prev.map(c => c.id === cId ? { ...c, aulas: c.aulas.map(a => a.id === aId ? { ...a, status: a.status === "publicada" ? "rascunho" : "publicada" } : a) } : c));
    toast.success("Status atualizado.");
  };

  const handleDelete = (cId: string, aId: string) => {
    setCursos(prev => prev.map(c => c.id === cId ? { ...c, aulas: c.aulas.filter(a => a.id !== aId) } : c));
    toast.success("Aula removida.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header />
      <div className="max-w-5xl mx-auto py-6 px-4 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gerenciamento</h1>
            <p className="text-sm text-muted-foreground">Administre seus cursos</p>
          </div>
          <Button className="bg-[#2F52E0] hover:bg-[#1e3bb3] h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer shadow-sm"><Plus className="h-4 w-4 mr-1" /> Novo Curso</Button>
        </div>

        <StatsCards 
          cursosCount={cursos.length} 
          aulasCount={cursos.reduce((acc, c) => acc + c.aulas.length, 0)} 
          alunosCount={cursos.reduce((acc, c) => acc + c.alunos, 0)} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="font-bold text-base px-1 flex items-center gap-2 text-gray-700"><Settings size={16} /> Seus Cursos</h2>
            <div className="space-y-2">
              {cursos.map(c => (
                <CourseCard key={c.id} curso={c} isSelected={cursoSelecionado === c.id} onClick={() => setCursoSelecionado(c.id)} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <LessonManager curso={cursoAtivo} onToggle={handleToggle} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}