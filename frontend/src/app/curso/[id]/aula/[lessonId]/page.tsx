"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import VideoPlayer from "./VideoPlayer";
import LessonContent from "./LessonContent";
import AIChatPanel from "./AIChatPanel";
import LoadingScreen from "@/components/LoadingScreen";
import { getCourseDetail, getMyCourses } from "@/services/courses";

export default function Aula() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = Number(params?.id);
  const lessonId = Number(params?.lessonId);

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(400);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false); 

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (isNaN(courseId) || isNaN(lessonId)) {
        console.warn("IDs inválidos na URL, aguardando inicialização...");
        return;
      }

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

        if (!token) {
          console.warn("Token não encontrado. Redirecionando para login/curso...");
          if (isMounted) router.replace(`/curso/${courseId}`);
          return;
        }

        const [myCourses, data] = await Promise.all([
          getMyCourses().catch((err) => {
            console.error("Erro ao buscar meus cursos:", err);
            return null;
          }),
          getCourseDetail(courseId).catch((err) => {
            console.error("Erro ao buscar detalhe do curso:", err);
            return null;
          })
        ]);

        if (!isMounted) return;

        if (!data || !myCourses) {
          setErrorMessage("Não foi possível conectar ao servidor Django. Verifique se o backend está rodando.");
          return;
        }

        const isEnrolled = myCourses?.some((c: any) => {
          if (!c) return false;
          if (c.course_id !== undefined && c.course_id !== null) return Number(c.course_id) === courseId;
          if (typeof c === "number" || typeof c === "string") return Number(c) === courseId;
          if (c.course && typeof c.course === "object") return Number(c.course.id) === courseId;
          if (c.course) return Number(c.course) === courseId;
          return Number(c.id) === courseId;
        });

        if (!isEnrolled) {
          console.warn(`Usuário não matriculado no curso ${courseId}.`);
          router.replace(`/curso/${courseId}`);
          return;
        }

        const allLessons = data.modules?.flatMap((m: any) => m.lessons || []) || [];
        
        const currentLesson = allLessons.find((l: any) => {
          const id = l.id ?? l.lesson_id;
          return Number(id) === lessonId;
        });

        const index = allLessons.findIndex((l: any) => {
          const id = l.id ?? l.lesson_id;
          return Number(id) === lessonId;
        });

        if (currentLesson) {
          setCourse({ ...data, lessons: allLessons });
          setLesson({ ...currentLesson, index });
          setIsAuthorized(true);
          setErrorMessage(null);
        } else {
          setErrorMessage(`A aula ${lessonId} não foi encontrada neste curso.`);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da aula:", err);
        if (isMounted) {
          setErrorMessage("Erro de comunicação com o servidor.");
        }
      }
    }

    load();

    return () => {
      isMounted = false; 
    };
  }, [courseId, lessonId, router]);

  const handleEmitirCertificado = async () => {
    setIsGeneratingCertificate(true);
    try {
      const token = localStorage.getItem("access");

      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/certificado/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Você precisa concluir todas as aulas antes de emitir seu certificado.");
        return;
      }

      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Erro ao emitir certificado:", error);
      alert("Não foi possível conectar ao servidor backend.");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FA] gap-4 p-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Ops! Algo deu errado</h2>
        <p className="text-sm text-gray-600 max-w-md">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-[#2F52E0] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!isAuthorized || !course || !lesson) {
    return <LoadingScreen text="Validando seu acesso à aula..." />;
  }

  const lessonIndex = lesson.index;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden">
      <Header />

      <Breadcrumb 
        items={[
          { label: "Meus Cursos", href: "/meus-cursos" },
          { label: course.title || "Detalhes do Curso", href: `/curso/${courseId}` },
          { label: lesson.title || "Aula" }
        ]} 
      />

      <div className="flex flex-row flex-1 overflow-hidden w-full relative">
        <main className="flex-1 flex flex-col overflow-y-auto h-full items-center bg-gray-50 pt-4 pb-12 px-4 lg:px-6 custom-scrollbar">
          <div className="w-full max-w-5xl flex flex-col justify-start gap-6">
            <VideoPlayer
              lesson={lesson}
              onToggleAI={() => setAiOpen(!aiOpen)}
            />

            <LessonContent
              course={course}
              lesson={lesson}
              lessonIndex={lessonIndex}
              aiOpen={aiOpen}
              setAiOpen={setAiOpen}
              lessonsOpen={lessonsOpen}
              setLessonsOpen={setLessonsOpen}
              prevLesson={course.lessons[lessonIndex - 1]}
              nextLesson={course.lessons[lessonIndex + 1]}
              onEmitirCertificado={handleEmitirCertificado}
              isGeneratingCertificate={isGeneratingCertificate}
            />
          </div>
        </main>

        {aiOpen && (
          <AIChatPanel
            lessonTitle={lesson.title}
            lessonId={lessonId} 
            onClose={() => setAiOpen(false)}
            chatWidth={chatWidth}
            setChatWidth={setChatWidth}
          />
        )}
      </div>
    </div>
  );
}