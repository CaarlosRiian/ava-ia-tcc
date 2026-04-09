"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import CourseHero from "./CourseHero";
import CourseLessonsSidebar from "./CourseLessonsSidebar";
import { mockCourses } from "@/data/courses";

export default function CursoDetalhe() {
  const params = useParams();
  const courseId = Number(params.id); 
  const course = mockCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Header />
        <div className="container mx-auto py-20 text-center">
          <p className="text-gray-500 mb-4">Curso não encontrado.</p>
          <Link href="/descobrir" className="px-6 py-2 bg-[#2F52E0] text-white rounded-lg font-bold">
            Voltar para explorar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <Link href="/descobrir" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2F52E0] mb-8 group transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          Voltar para cursos
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <CourseHero course={course} />
            
            <div className="mt-10">
              <h2 className="text-xl font-bold text-[#161B1D] mb-4">O que você vai aprender</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-600">
                {["Conceitos Fundamentais", "Práticas do Mundo Real", "Projetos práticos com IA", "Suporte da comunidade"].map((item) => (
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