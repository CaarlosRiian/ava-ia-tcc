"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import CourseCard from "@/components/CourseCard";
import { ProfessorHero } from "./_components/professor-hero";
import LoadingScreen from "@/components/LoadingScreen";
import { formatName } from "@/utils/formatName";

export default function PerfilProfessor() {
  const params = useParams();
  const slug = params?.slug as string;

  const [professor, setProfessor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      console.log("FRONT - Slug não foi encontrado.");
      return;
    }

    const url = `http://localhost:8000/api/professor/${slug}/`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProfessor(data);
      })
      .catch((err) => console.error("FRONT Erro na requisição fetch:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <LoadingScreen text="Carregando dados do professor..." />;
  }

  const rawName = professor?.username || professor?.name || "";
  const displayFormattedName = formatName(rawName);

  if (!professor) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Breadcrumb items={[{ label: "Professor não encontrado" }]} />
        <div className="container mx-auto py-20 text-center">
          <p className="text-gray-400 mb-6">Professor não encontrado.</p>
          <Link href="/descobrir">
            <button className="px-6 py-2 bg-[#2F52E0] text-white rounded-xl font-bold cursor-pointer">
              Voltar para Explorar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const initials = rawName
    ? rawName
      .replaceAll("_", " ")
      .trim()
      .split(/\s+/)
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "PR";

  const courses = professor.courses || [];

  const totalLessons = courses.reduce((acc: number, course: any) => {
    return acc + (course.modules?.length || 0);
  }, 0);

  const totalStudents = courses.reduce((acc: number, course: any) => {
    return acc + (course.students_count || course.students || 3);
  }, 0);

  let formattedJoinedAt = "Jun/2026";
  const rawDate = professor.created_at || professor.date_joined;

  if (rawDate) {
    try {
      const date = new Date(rawDate);
      const month = date.toLocaleDateString("pt-BR", { month: "short" });
      const year = date.getFullYear();
      const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).replace(".", "");
      formattedJoinedAt = `${formattedMonth}/${year}`;
    } catch (e) {
      console.error("Erro ao formatar data do professor:", e);
    }
  }

  const stats = {
    coursesCount: courses.length,
    students: Number(totalStudents),
    lessons: Number(totalLessons),
    joinedAt: formattedJoinedAt,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />

      <Breadcrumb items={[{ label: `${displayFormattedName}` }]} />

      <main className="flex-1 container mx-auto px-6 pt-6 pb-12">
        
        <ProfessorHero
          name={displayFormattedName}
          bio={professor.bio || "Este professor ainda não adicionou uma descrição profissional."}
          initials={initials}
          stats={stats}
        />

        <div className="mb-10 mt-12">
          <h2 className="text-2xl font-black text-[#161B1D]">Cursos publicados</h2>
          <p className="text-gray-500 font-light">Explore o conteúdo criado por {displayFormattedName}</p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course: any) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                thumbnail={course.thumbnail}
                lessonsCount={course.modules?.length || 0}
                author={displayFormattedName}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 bg-white rounded-3xl text-center border border-gray-200 shadow-sm max-w-xl mx-auto">
            <p className="text-gray-400 font-light">
              Este professor ainda não possui cursos publicados.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}