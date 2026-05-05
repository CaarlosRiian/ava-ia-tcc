"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import { ArrowLeft } from "lucide-react";
import { ProfessorHero } from "./_components/professor-hero";

export default function PerfilProfessor() {
  const params = useParams();
  const slug = params?.slug as string;

  const [professor, setProfessor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:8000/api/professor/${slug}/`)
      .then((res) => res.json())
      .then((data) => setProfessor(data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="p-10">Carregando...</div>;
  }

  if (!professor) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto py-20 text-center">
          <p className="text-gray-400 mb-6">Professor não encontrado.</p>
          <Link href="/descobrir">
            <button className="px-6 py-2 bg-[#2F52E0] text-white rounded-xl font-bold">
              Voltar para Explorar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const courses = professor.courses || [];

  const initials =
    professor.username
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const stats = {
    coursesCount: courses.length,
    hours: 0, 
    lessons: 0,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-10">
        <Link href="/descobrir" className="flex items-center gap-2 text-gray-400 hover:text-[#2F52E0] transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Voltar para cursos</span>
        </Link>

        <ProfessorHero 
          name={professor.name}
          bio={professor.bio}
          specialties={professor.specialties}
          initials={initials}
          stats={stats}
        />

        <div className="mb-10">
          <h2 className="text-2xl font-black text-[#161B1D]">Cursos publicados</h2>
          <p className="text-gray-400 text-sm">Explore o conteúdo criado por {professor.name}</p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course: any) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <div className="py-12 bg-white rounded-2xl text-center border-2 border-dashed border-gray-100">
            <p className="text-gray-400">
              Este professor ainda não possui cursos publicados.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}