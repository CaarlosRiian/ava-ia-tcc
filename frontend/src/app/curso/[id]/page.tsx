"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import LoadingScreen from "@/components/LoadingScreen";
import CourseHero from "./CourseHero";
import CourseLessonsSidebar from "./CourseLessonsSidebar";
import { getCourseDetail, getMyCourses, toggleCourseFavorite } from "@/services/courses";

export default function CursoDetalhe() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false); 

  useEffect(() => {
    async function checkAuthAndFetchCourse() {
      try {
        const token = localStorage.getItem("access");

        if (!token) {
          router.replace(`/curso/${courseId}/detalhes`);
          return;
        }

        const responseFavorites = await fetch(`http://localhost:8000/api/favorites/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (responseFavorites.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/entrar";
          return;
        }

        const favoritesData = responseFavorites.ok ? await responseFavorites.json() : [];

        const [myCourses, courseData] = await Promise.all([
          getMyCourses(),
          getCourseDetail(courseId)
        ]);

        const isEnrolled = myCourses?.some((c: any) => {
          if (!c) return false;
          if (c.course_id !== undefined && c.course_id !== null) return Number(c.course_id) === courseId;
          if (typeof c === "number" || typeof c === "string") return Number(c) === courseId;
          if (c.course && typeof c.course === "object") return Number(c.course.id) === courseId;
          if (c.course) return Number(c.course) === courseId;
          return Number(c.id) === courseId;
        });

        if (!isEnrolled) {
          router.replace(`/curso/${courseId}/detalhes`);
          return;
        }

        const alreadyFavorited = favoritesData?.some((f: any) => Number(f.course) === courseId);
        
        setIsFavorited(alreadyFavorited);
        setCourse(courseData);
        setIsAuthorized(true);
      } catch (err) {
        console.error("Erro na verificação de acesso:", err);
        router.replace(`/curso/${courseId}/detalhes`);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      checkAuthAndFetchCourse();
    }
  }, [courseId, router]);

  const handleToggleFavorite = async () => {
    const previousState = isFavorited;
    try {
      setIsFavorited(!isFavorited);

      const data = await toggleCourseFavorite(courseId);
      
      if (data && typeof data.favorited === "boolean") {
        setIsFavorited(data.favorited);
      }
    } catch (error) {
      console.error("Erro ao favoritar curso:", error);
      setIsFavorited(previousState);
    }
  };

  if (loading || !isAuthorized) {
    return <LoadingScreen text="Validando sua inscrição no curso..." />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Header />
        <Breadcrumb items={[{ label: "Meus Cursos", href: "/meus-cursos" }, { label: "Curso não encontrado" }]} />
        <div className="container mx-auto py-20 text-center">
          <p className="text-gray-500 mb-4">Curso não encontrado.</p>
          <Link href="/meus-cursos" className="text-blue-600 hover:underline">Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header />

      <Breadcrumb 
        items={[
          { label: "Meus Cursos", href: "/meus-cursos" },
          { label: course.title || "Detalhes do Curso" }
        ]} 
      />

      <main className="flex-1 container mx-auto px-6 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <CourseHero
              course={course}
              isFavorited={isFavorited}
              onFavoriteToggle={handleToggleFavorite}
              onPlayClick={(e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }

                const allLessons = course.modules?.flatMap((m: any) => m.lessons) || [];

                if (allLessons.length > 0) {
                  const targetLessonId = course.current_lesson_id || allLessons[0].id;
                  const urlFinal = `/curso/${courseId}/aula/${targetLessonId}`;

                  router.push(urlFinal);
                }
              }}
            />
          </div>
          
          <div className="lg:col-span-1">
            <CourseLessonsSidebar course={course} />
          </div>
        </div>
      </main>
    </div>
  );
}