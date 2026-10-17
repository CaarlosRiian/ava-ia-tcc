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
      setLoading(false);
      return;
    }

    const url = `http://localhost:8000/api/professor/${slug}/`;
    const token = localStorage.getItem("access_token");

    fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Professor não encontrado");
        return res.json();
      })
      .then((data) => {
        setProfessor(data);
      })
      .catch((err) => console.error("Erro ao buscar perfil:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <LoadingScreen text="Carregando dados do professor..." />;
  }

  if (!professor) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Breadcrumb items={[{ label: "Professor não encontrado" }]} />
        <div className="container mx-auto py-20 text-center">
          <p className="text-gray-400 mb-6">Professor não encontrado.</p>
          <Link href="/descobrir">
            <button className="px-6 py-2 bg-[#FF7A00] text-white rounded-xl font-bold cursor-pointer transition-all hover:opacity-90">
              Voltar para Explorar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const rawName = professor?.username || "";
  const displayFormattedName = formatName(rawName);

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
  const apiStats = professor.stats || {};

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
      console.error("Erro ao formatar data:", e);
    }
  }

  const stats = {
    coursesCount: apiStats.coursesCount ?? courses.length,
    students: professor.students_count || 0,
    lessons: apiStats.lessons || 0,
    joinedAt: formattedJoinedAt,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />

      <Breadcrumb items={[{ label: displayFormattedName }]} />

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
                slug={course.slug}
                thumbnail={course.thumbnail}
                price={course.price}
                lessonsCount={course.lessons_count || 0}
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