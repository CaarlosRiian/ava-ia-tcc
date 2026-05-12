"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings } from "lucide-react";

import Header from "@/components/Header";
import { CourseCard } from "./_components/CourseCard-Item";
import { StatsCards } from "./_components/StatsCards";
import { LessonManager } from "./_components/LessonManager";
import { CourseFormModal } from "./_components/CourseFormModal";
import { getCourses, createCourse, updateCourse } from "./_services/courses";
import { getCategories } from "@/services/categories";
import type { CourseAPI, CourseUI, Category } from "@/types/course";

export default function GerenciamentoAulas() {
  const [cursos, setCursos] = useState<CourseUI[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [openModal, setOpenModal] = useState(false);

  const [editingCourse, setEditingCourse] =
    useState<CourseUI | null>(null);

  const cursoAtivo = cursos.find((c) => c.id === cursoSelecionado);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, courses] = await Promise.all([
          getCategories(),
          getCourses(),
        ]);

        console.log("COURSES RAW:", courses);

        setCategories(cats);

        const formatted: CourseUI[] = courses.map((curso: CourseAPI) => ({
          ...curso,
          aulas: curso.modules?.flatMap((m) => m.lessons) || [],
        }));

        setCursos(formatted);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados");
      }
    }

    loadData();
  }, []);

  const handleToggle = async (cId: string, aId: string) => {
    setCursos((prev) =>
      prev.map((c) =>
        c.id === cId
          ? {
            ...c,
            aulas: c.aulas.map((a) =>
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
            aulas: c.aulas.filter((a) => a.id !== aId)
          }
          : c
      )
    );

    toast.success("Aula removida.");
  };

  const handleCreateCourse = async (formData: FormData) => {
    try {
      const newCourse = await createCourse(formData);

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
  };

  const handleUpdateCourse = async (
    courseId: string,
    formData: FormData
  ) => {
    try {
      const updated = await updateCourse(
        courseId,
        formData
      );

      setCursos((prev) =>
        prev.map((curso) =>
          curso.id === courseId
            ? {
              ...curso,
              ...updated,
              aulas:
                updated.modules?.flatMap(
                  (m: any) => m.lessons
                ) || [],
            }
            : curso
        )
      );

      toast.success("Curso atualizado!");
    } catch (err) {
      console.error(err);

      toast.error("Erro ao atualizar curso");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header />
      <div className="max-w-5xl mx-auto py-6 px-4 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Gerenciamento
            </h1>
            <p className="text-sm text-muted-foreground">
              Administre seus cursos
            </p>
          </div>
          <button onClick={() => {
            setEditingCourse(null);
            setOpenModal(true);
          }}
            className="bg-[#2F52E0] hover:bg-[#1e3bb3] h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer shadow-sm text-white"
          > + Novo Curso
          </button>
          <CourseFormModal
            open={openModal}
            onOpenChange={setOpenModal}
            categories={categories}
            initialData={editingCourse}
            onCreate={handleCreateCourse}
            onEdit={handleUpdateCourse}
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
                <CourseCard key={c.id} curso={c} isSelected={cursoSelecionado === c.id} onClick={() => setCursoSelecionado(c.id)} onEdit={() => {
                  setEditingCourse(c);
                  setOpenModal(true);
                }} />
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