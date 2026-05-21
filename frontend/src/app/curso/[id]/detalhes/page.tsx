"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCourseDetail } from "@/services/courses"; 
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import CourseHero from "./_components/course-hero";
import CourseAbout from "./_components/course-about";
import CourseModules from "./_components/course-modules";
import CourseSidebar from "./_components/course-sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CursoDetalhePage() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!id) return;
      
      try {
        setLoading(true);
        const courseIdNum = Number(Array.isArray(id) ? id[0] : id);
        
        if (isNaN(courseIdNum)) {
          throw new Error("ID de curso inválido");
        }

        const data = await getCourseDetail(courseIdNum);
        setCourse(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro ao carregar o curso.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id]);

  if (loading) {
    return <LoadingScreen text="Carregando curso" />
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-destructive font-semibold">Aviso: {error || "Curso não encontrado."}</p>
        <Link href="/descobrir">
          <Button variant="outline" className="mt-4">Voltar para o catálogo</Button>
        </Link>
      </div>
    );
  }

  const lessons = course.lessons ?? [];
  const modules = Array.from({ 
    length: Math.max(1, Math.ceil(lessons.length / 4)) 
  }).map((_, i) => ({
    title: `Módulo ${i + 1}`,
    lessonsCount: lessons.slice(i * 4, i * 4 + 4).length,
  }));

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16">
        <CourseHero course={course} />

        <div className="max-w-7xl mx-auto w-full px-4 md:px-4 py-10">
          <div className="grid lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-2 space-y-12">
              <CourseAbout description={course.description} />
              <CourseModules modules={course.modules ?? []} />
            </div>

            <aside className="lg:col-span-1">
              <CourseSidebar course={{ ...course, id: String(course.id) }} />
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
}