"use client";

import { useState, useEffect } from "react";
import { getCourses, createCourse, updateCourse } from "../_services/courses";
import { createModule } from "../_services/modules";
import { createLesson } from "@/services/lessons";
import { createMaterial } from "../_services/materials";
import { getCategories } from "@/services/categories";
import type { CourseAPI, CourseUI, Category } from "@/types/course";

export function useCourseManagement() {
  const [cursos, setCursos] = useState<CourseUI[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [toastConfig, setToastConfig] = useState<{
    message: string | null;
    type: "success" | "error";
  }>({ message: null, type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastConfig({ message, type });

    setTimeout(() => {
      setToastConfig((prev) => (prev.message === message ? { ...prev, message: null } : prev));
    }, 5500);
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, message: null }));
  };

  const cursoAtivo = cursos.find((c) => String(c.id) === String(cursoSelecionado));

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, courses] = await Promise.all([getCategories(), getCourses()]);
        setCategories(cats);
        const formatted: CourseUI[] = courses.map((curso: CourseAPI) => ({
          ...curso,
          aulas: curso.modules?.flatMap((m) => m.lessons) || [],
        }));
        setCursos(formatted);
      } catch (err) {
        console.error(err);
        showToast("Erro ao carregar dados", "error");
      }
    }
    loadData();
  }, []);

  const handleCreateModule = async (title: string) => {
    if (!cursoSelecionado) return;
    try {
      const lastOrder = cursoAtivo?.modules?.length
        ? Math.max(...cursoAtivo.modules.map((m: any) => m.order))
        : 0;

      const novoModulo = await createModule({
        title,
        course: Number(cursoSelecionado),
        order: lastOrder + 1,
      });

      setCursos((prevCursos) =>
        prevCursos.map((curso) => {
          if (String(curso.id) === String(cursoSelecionado)) {
            return {
              ...curso,
              modules: [...(curso.modules || []), { ...novoModulo, lessons: novoModulo.lessons || [] }],
            };
          }
          return curso;
        })
      );

      showToast("Módulo criado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar módulo", "error");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {

      setCursos((prevCursos) =>
        prevCursos.map((curso) => {
          if (String(curso.id) === String(cursoSelecionado)) {
            return {
              ...curso,
              modules: curso.modules?.filter((m: any) => String(m.id) !== String(moduleId)),
            };
          }
          return curso;
        })
      );

      showToast("Módulo excluído com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao excluir o módulo", "error");
    }
  };

  const handleCreateLesson = async (formData: FormData) => {
    try {
      const novaAula = await createLesson(formData);
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

      showToast("Aula criada com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar aula", "error");
    }
  };

  return {
    cursos,
    cursoSelecionado,
    setCursoSelecionado,
    categories,
    cursoAtivo,
    toastConfig,
    showToast,
    hideToast,
    handleCreateModule,
    handleCreateLesson,
    handleDeleteModule,
    setCursos,
  };
}