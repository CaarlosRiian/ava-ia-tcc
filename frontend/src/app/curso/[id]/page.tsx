"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import CourseHero from "./CourseHero";
import CourseLessonsSidebar from "./CourseLessonsSidebar";
import { getCourseDetail } from "@/services/courses";

export default function CursoDetalhe() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await getCourseDetail(courseId);
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Header />
        <div className="container mx-auto py-20 text-center">
          <p className="text-gray-500 mb-4">Curso não encontrado.</p>
          <Link href="/descobrir">Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <Link
          href="/meus-cursos"
          className="inline-flex items-center gap-2 text-sm text-gray-500 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para meus cursos
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <CourseHero course={course} />

            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">
                O que você vai aprender
              </h2>

              <div className="grid sm:grid-cols-2 gap-3 text-gray-600">
                {[
                  "Conceitos Fundamentais",
                  "Práticas do Mundo Real",
                  "Projetos práticos",
                  "Suporte da comunidade",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2F52E0]" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CourseLessonsSidebar course={course} />
        </div>
      </main>
    </div>
  );
}