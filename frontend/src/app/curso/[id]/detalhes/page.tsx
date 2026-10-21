"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCourseDetail, getMyCourses } from "@/services/courses"; 
import { getWishlist, toggleWishlist } from "../../../lista_desejos/wishlist.service";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import CourseHero from "./_components/course-hero";
import CourseAbout from "./_components/course-about";
import CourseModules from "./_components/course-modules";
import CourseSidebar from "./_components/course-sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/Toast";

export default function CursoDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type?: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: undefined,
    isVisible: false,
  });

  const showToast = (message: string, type?: "success" | "error") => {
    setToastConfig({ message, type, isVisible: true });
  };

  const courseIdNum = Number(Array.isArray(id) ? id[0] : id);

  useEffect(() => {
    async function loadCourseAndCheckAccess() {
      if (!id || isNaN(courseIdNum)) {
        setError("ID de curso inválido");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem("access");

        if (token) {
          const [myCourses, courseData, wishlistData] = await Promise.all([
            getMyCourses().catch(() => []),
            getCourseDetail(courseIdNum),
            getWishlist(token).catch(() => [])
          ]);

          const wishlistArray = Array.isArray(wishlistData) 
            ? wishlistData 
            : (Array.isArray(wishlistData?.results) ? wishlistData.results : []);

          const alreadyInWishlist = wishlistArray.some((item: any) => {
            const cId = typeof item.course === "object" ? item.course?.id : item.course;
            return Number(cId) === courseIdNum;
          });

          setIsInWishlist(alreadyInWishlist);

          const isEnrolled = myCourses?.some((c: any) => {
            if (!c) return false;
            
            if (c.course_id !== undefined && c.course_id !== null) {
              return Number(c.course_id) === courseIdNum;
            }
            if (typeof c === "number" || typeof c === "string") return Number(c) === courseIdNum;
            if (c.course && typeof c.course === "object") return Number(c.course.id) === courseIdNum;
            if (c.course) return Number(c.course) === courseIdNum;
            return Number(c.id) === courseIdNum;
          });

          setCourse(courseData);
        } else {
          const data = await getCourseDetail(courseIdNum);
          setCourse(data);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro ao carregar o curso.");
      } finally {
        setLoading(false);
      }
    }

    loadCourseAndCheckAccess();
  }, [id, courseIdNum, router]);

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      showToast("Faça login para adicionar cursos à sua lista de desejos", "error");
      setTimeout(() => {
        router.push("/entrar");
      }, 1500);
      return;
    }

    const previousState = isInWishlist;
    const nextState = !isInWishlist;

    try {
      setIsInWishlist(nextState);

      if (nextState) {
        showToast("Curso adicionado à sua Lista de Desejos!", "success");
      } else {
        showToast("Curso removido da sua Lista de Desejos", undefined);
      }

      const data = await toggleWishlist(token, courseIdNum);
      if (data && typeof data.in_wishlist === "boolean") {
        setIsInWishlist(data.in_wishlist);
      }
    } catch (err) {
      console.error("Erro ao alternar lista de desejos:", err);
      setIsInWishlist(previousState);
      showToast("Erro ao atualizar a lista de desejos. Tente novamente.", "error");
    }
  };

  if (loading) {
    return <LoadingScreen text="Carregando curso" />;
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

  return (
    <div className="bg-background min-h-screen flex flex-col relative">
      <Header />

      {toastConfig.isVisible && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig((prev) => ({ ...prev, isVisible: false }))}
        />
      )}

      <main className="flex-1 pb-16">
        <CourseHero 
          course={course} 
          isInWishlist={isInWishlist}
          onToggleWishlist={handleToggleWishlist}
        />

        <div className="max-w-7xl mx-auto w-full px-4 md:px-4 py-10">
          <div className="grid lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-2 space-y-12">
              <CourseAbout description={course.description} />
              <CourseModules modules={course.modules ?? []} />
            </div>

            <aside className="lg:col-span-1">
              <CourseSidebar 
                course={{ ...course, id: String(course.id) }} 
                isInWishlist={isInWishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
}