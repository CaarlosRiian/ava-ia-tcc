"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings } from "lucide-react";

import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb";
import { CourseCard } from "./_components/CourseCard-Item";
import { StatsCards } from "./_components/StatsCards";
import { LessonManager } from "./_components/LessonManager";
import { CourseFormModal } from "./_components/CourseFormModal";
import { AddOptionsModal } from "./_components/AddOptionsModal";
import { createMaterial } from "./_services/materials";
import { getCourses, createCourse, updateCourse } from "./_services/courses";
import { getCategories } from "@/services/categories";
import { createModule } from "./_services/modules";
import { createLesson } from "@/services/lessons";
import type { CourseAPI, CourseUI, Category } from "@/types/course";

export default function GerenciamentoAulas() {
  const [cursos, setCursos] = useState<CourseUI[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openAddOptionsModal, setOpenAddOptionsModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseUI | null>(null);

  const cursoAtivo = cursos.find((c) => c.id === cursoSelecionado);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, courses] = await Promise.all([
          getCategories(),
          getCourses(),
        ]);

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
                  status: a.status === "publicada" ? "rascunho" : "publicada",
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
            aulas: c.aulas.filter((a) => a.id !== aId),
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

  const handleUpdateCourse = async (courseId: string, formData: FormData) => {
    try {
      const updated = await updateCourse(courseId, formData);

      setCursos((prev) =>
        prev.map((curso) =>
          curso.id === courseId
            ? {
              ...curso,
              ...updated,
              aulas: updated.modules?.flatMap((m: any) => m.lessons) || [],
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

  const handleCreateModule = async (title: string) => {
    try {
      if (!cursoSelecionado) return;

      const lastOrder = cursoAtivo?.modules?.length
        ? Math.max(...cursoAtivo.modules.map((m: any) => m.order))
        : 0;

      await createModule({
        title,
        course: Number(cursoSelecionado),
        order: lastOrder + 1,
      });

      toast.success("Módulo criado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar módulo");
    }
  };

  const handleCreateLesson = async (formData: FormData) => {
    try {
      const novaAula = await createLesson(formData);
      toast.success("Aula criada com sucesso!");

      const moduloIdAlvo = formData.get("module");

      setCursos((prevCursos) =>
        prevCursos.map((curso) => {
          if (String(curso.id) === String(cursoSelecionado)) {
            return {
              ...curso,
              aulas: [...curso.aulas, novaAula],
              modules: curso.modules?.map((modulo) => {
                if (String(modulo.id) === String(moduloIdAlvo)) {
                  return {
                    ...modulo,
                    lessons: [...(modulo.lessons || []), novaAula],
                  };
                }
                return modulo;
              }),
            };
          }
          return curso;
        })
      );

    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar aula");
    }
  };

  const handleAddMaterial = async (payload: any) => {
    try {
      const formData = new FormData();
      formData.append("lesson", String(payload.lesson));
      formData.append("title", payload.title);
      formData.append("material_type", payload.material_type);

      if (payload.file) {
        formData.append("file", payload.file);
      } else if (payload.raw_content) {
        formData.append("raw_content", payload.raw_content);
      }

      const novoMaterialSalvo = await createMaterial(formData);
      toast.success("Material de apoio integrado ao banco da IA!");

      if (cursoAtivo) {
        const updatedCourses = cursos.map((c) => {
          if (String(c.id) === String(cursoSelecionado)) {
            return {
              ...c,
              modules: c.modules?.map((m) => {
                return {
                  ...m,
                  lessons: m.lessons?.map((l) => {
                    if (String(l.id) === String(payload.lesson)) {
                      return {
                        ...l,
                        materials: [...((l as any).materials || []), novoMaterialSalvo],
                      };
                    }
                    return l;
                  }),
                };
              }),
            };
          }
          return c;
        });

        setCursos(updatedCourses);
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao salvar material didático.");
      throw err;
    }
  };

  const handleDeleteMaterial = async (lessonId: string, materialId: string) => {
    try {
      toast.success("Material removido com sucesso!");

      const updatedCourses = cursos.map((c) => {
        if (String(c.id) === String(cursoSelecionado)) {
          return {
            ...c,
            modules: c.modules?.map((m) => ({
              ...m,
              lessons: m.lessons?.map((l) => {
                if (String(l.id) === String(lessonId)) {
                  return {
                    ...l,
                    materials: (l as any).materials?.filter((mat: any) => mat.id !== materialId) || [],
                  };
                }
                return l;
              }),
            })),
          };
        }
        return c;
      });

      setCursos(updatedCourses);
    } catch (err) {
      toast.error("Erro ao remover material.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header />

      <Breadcrumb items={[{ label: "Gerenciar cursos" }]} />

      <main className="flex-1 max-w-5xl w-full mx-auto pt-6 pb-12 px-4 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Gerenciamento
            </h1>
            <p className="text-sm text-muted-foreground">
              Administre seus cursos e conteúdos didáticos
            </p>
          </div>
          <button onClick={() => {
            setEditingCourse(null);
            setOpenModal(true);
          }}
            className="bg-[#2F52E0] hover:bg-[#1e3bb3] h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer shadow-sm text-white transition" >
            + Novo Curso
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
            <h2 className="font-bold text-base px-1 flex items-center gap-2 text-gray-700">
              <Settings size={16} /> Seus Cursos
            </h2>
            <div className="space-y-2">
              {cursos.map((c) => (
                <CourseCard
                  key={c.id}
                  curso={c}
                  isSelected={cursoSelecionado === c.id}
                  onClick={() => setCursoSelecionado(c.id)}
                  onEdit={() => {
                    setEditingCourse(c);
                    setOpenModal(true);
                  }}
                />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <LessonManager
              curso={cursoAtivo as any}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onOpenAddOptions={() => setOpenAddOptionsModal(true)}
            />
          </div>
        </div>
      </main>

      <AddOptionsModal
        isOpen={openAddOptionsModal}
        onClose={() => setOpenAddOptionsModal(false)}
        cursoAtivo={cursoAtivo}
        onAddMaterial={handleAddMaterial}
        onCreateModule={handleCreateModule}
        onCreateLesson={handleCreateLesson}
      />
    </div>
  );
}