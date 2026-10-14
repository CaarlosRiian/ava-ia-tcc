"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb";
import VideoPlayer from "./VideoPlayer";
import LessonContent from "./LessonContent";
import AIChatPanel from "./AIChatPanel";
import LoadingScreen from "@/components/LoadingScreen";
import CoursePlaylist from "../_components/CoursePlaylist";
import Tabs from "../_components/tabs/Tabs";
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
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLElement>(null);

  const refreshProgress = useCallback(async () => {
    try {
      const [myCourses, data] = await Promise.all([
        getMyCourses().catch(() => null),
        getCourseDetail(courseId).catch(() => null)
      ]);

      const matchedCourse = myCourses?.find((c: any) => {
        const id = c.course_id !== undefined ? c.course_id : c.id;
        return Number(id) === courseId;
      });

      const apiProgress = matchedCourse ? matchedCourse.progress : 0;
      const allLessons = data?.modules?.flatMap((m: any) => m.lessons || []) || [];

      const totalLessonsCount = allLessons.length;
      const completedLessonsCount = allLessons.filter((l: any) => l.completed || l.is_completed || l.id === lessonId).length;

      const isActuallyFinished = apiProgress >= 100 || (totalLessonsCount > 0 && completedLessonsCount >= totalLessonsCount);

      setCourse((prev: any) => ({
        ...(prev || data),
        modules: data?.modules ?? prev?.modules,
        lessons: allLessons,
        progress: isActuallyFinished ? 100 : apiProgress
      }));
    } catch (err) {
      setCourse((prev: any) => ({ ...prev, progress: 100 }));
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    const handleOpenChat = () => setAiOpen(true);
    window.addEventListener("prefill-and-open-chat", handleOpenChat);
    return () => window.removeEventListener("prefill-and-open-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    if (aiOpen && window.matchMedia("(max-width: 1023px)").matches) {
      sidebarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [aiOpen]);

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

        const matchedCourse = myCourses.find((c: any) => {
          const id = c.course_id !== undefined ? c.course_id : c.id;
          return Number(id) === courseId;
        });
        const currentProgress = matchedCourse ? matchedCourse.progress : 0;

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
          setCourse({
            ...data,
            lessons: allLessons,
            progress: currentProgress
          });
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
    setCertificateError(null);
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(`http://localhost:8000/api/courses/${courseId}/certificado/`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        setCertificateError(errorData.error || "Não foi possível emitir o certificado.");
        return;
      }

      const htmlContent = await res.text();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Erro ao emitir certificado:", error);
      setCertificateError("Não foi possível conectar ao servidor backend.");
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

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full overflow-y-auto lg:overflow-hidden">
        <main className="min-w-0 lg:flex-1 lg:h-full lg:overflow-y-auto bg-white custom-scrollbar">
          <VideoPlayer lesson={lesson} onToggleAI={() => setAiOpen(!aiOpen)} />

          <LessonContent
            key={lesson.id}
            course={course}
            lesson={lesson}
            lessonIndex={lessonIndex}
            aiOpen={aiOpen}
            setAiOpen={setAiOpen}
            prevLesson={course.lessons[lessonIndex - 1]}
            nextLesson={course.lessons[lessonIndex + 1]}
            onEmitirCertificado={handleEmitirCertificado}
            isGeneratingCertificate={isGeneratingCertificate}
            courseProgress={course.progress}
            onLessonCreateOrComplete={refreshProgress}
            certificateError={certificateError}
          />
        </main>

        <aside
          ref={sidebarRef}
          aria-label="Painel lateral do curso"
          className="w-full lg:w-[380px] xl:w-[420px] shrink-0 h-[640px] lg:h-full border-t lg:border-t-0 lg:border-l border-gray-200 bg-white"
        >
          <Tabs
            ariaLabel="Conteúdo do curso e Tutor de IA"
            activeId={aiOpen ? "ai" : "course"}
            onActiveChange={(id) => setAiOpen(id === "ai")}
            className="flex flex-col h-full"
            panelClassName="flex-1 min-h-0 overflow-hidden"
            tabs={[
              {
                id: "course",
                label: "Conteúdo do curso",
                content: (
                  <CoursePlaylist
                    course={course}
                    currentLessonId={lessonId}
                    currentLessonCompleted={!!(lesson.completed || lesson.is_completed) || undefined}
                  />
                ),
              },
              {
                id: "ai",
                eager: true,
                label: (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Tutor de IA
                  </span>
                ),
                content: <AIChatPanel key={lessonId} lessonTitle={lesson.title} lessonId={lessonId} />,
              },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}