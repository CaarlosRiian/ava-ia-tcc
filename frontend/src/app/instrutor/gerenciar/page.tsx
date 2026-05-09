"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/Header";
import { CourseCard } from "./_components/CourseCard-Item";
import { StatsCards } from "./_components/StatsCards";
import { LessonManager } from "./_components/LessonManager";
import { CreateCourseModal } from "./_components/CreateCourseModal";
import { getAccessToken } from "@/services/auth";

type Aula = {
  id: string;
  title: string;
  status?: string;
};

type Curso = {
  id: string;
  title: string;
  modules: {
    lessons: Aula[];
  }[];
  alunos: number;
};

export default function GerenciamentoAulas() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
  async function load() {
    try {
      const token = getAccessToken();

      if (!token) {
        toast.error("Usuário não autenticado");
        return;
      }

      const res = await fetch(
        "http://127.0.0.1:8000/api/courses/instructor_dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const list = Array.isArray(data) ? data : data?.results ?? [];

      const formatted = list.map((curso: Curso) => ({
        ...curso,
        aulas: curso.modules?.flatMap((m: any) => m.lessons) || [],
      }));

      setCursos(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar cursos");
    }
  }

  load();
}, []);

  const cursoAtivo = cursos.find((c) => c.id === cursoSelecionado);

  const handleToggle = async (cId: string, aId: string) => {
    setCursos((prev) =>
      prev.map((c) =>
        c.id === cId
          ? {
              ...c,
              aulas: c.aulas.map((a: any) =>
                a.id === aId
                  ? {
                      ...a,
                      status:
                        a.status === "publicada"
                          ? "rascunho"
                          : "publicada",
                    }
                  : a
              ),
            }
          : c
      )
    );

    toast.success("Status atualizado.");
  };

  const handleDelete = (cId: string, aId: string) => {
    setCursos((prev) =>
      prev.map((c) =>
        c.id === cId
          ? {
              ...c,
              aulas: c.aulas.filter((a: any) => a.id !== aId),
            }
          : c
      )
    );

    toast.success("Aula removida.");
  };

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await res.json();
      setCategories(data);
    }

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header />
      <div className="max-w-5xl mx-auto py-6 px-4 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gerenciamento</h1>
            <p className="text-sm text-muted-foreground">Administre seus cursos</p>
          </div>
          <CreateCourseModal
            categories={categories}
            onCreate={async (formData) => {
              try {
                const token = getAccessToken();

                const res = await fetch(
                  "http://127.0.0.1:8000/api/courses/",
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  }
                );

                if (!res.ok) {
                  throw new Error("Erro ao criar curso");
                }

                const newCourse = await res.json();

                setCursos((prev) => [
                  {
                    ...newCourse,
                    aulas: [],
                  },
                  ...prev,
                ]);

                toast.success("Curso criado com sucesso!");
              } catch (err) {
                console.error(err);
                toast.error("Erro ao criar curso");
              }
            }}
          />
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