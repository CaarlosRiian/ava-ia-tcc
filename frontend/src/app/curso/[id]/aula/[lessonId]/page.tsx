"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import VideoPlayer from "./VideoPlayer";
import LessonContent from "./LessonContent";
import AIChatPanel from "./AIChatPanel";
import LoadingScreen from "@/components/LoadingScreen";
import { getCourseDetail, getMyCourses } from "@/services/courses";

export default function Aula() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const lessonId = Number(params.lessonId);

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("access");

        if (!token) {
          router.replace(`/curso/${courseId}/detalhes`);
          return;
        }

        const [myCourses, data] = await Promise.all([
          getMyCourses(),
          getCourseDetail(courseId)
        ]);

        const isEnrolled = myCourses?.some((c: any) => {
          if (!c) return false;

          if (c.course_id !== undefined && c.course_id !== null) {
            return Number(c.course_id) === courseId;
          }

          if (typeof c === "number" || typeof c === "string") {
            return Number(c) === courseId;
          }

          if (c.course && typeof c.course === "object") {
            return Number(c.course.id) === courseId;
          }

          if (c.course) {
            return Number(c.course) === courseId;
          }

          return Number(c.id) === courseId;
        });

        if (!isEnrolled) {
          router.replace(`/curso/${courseId}/detalhes`);
          return;
        }

        const allLessons = data.modules?.flatMap((m: any) => m.lessons) || [];

        const currentLesson = allLessons.find(
          (l: any) => Number(l.id) === lessonId
        );

        const index = allLessons.findIndex(
          (l: any) => Number(l.id) === lessonId
        );

        if (currentLesson) {
          setCourse({
            ...data,
            lessons: allLessons,
          });

          setLesson({
            ...currentLesson,
            index,
          });

          setIsAuthorized(true);
        } else {
          console.warn(`Aula com ID ${lessonId} não encontrada.`);
        }
      } catch (err) {
        console.error("Erro na verificação de acesso à aula:", err);
        // router.replace(`/curso/${courseId}/detalhes`);
        alert("Erro de conexão com o servidor backend. Verifique o terminal do Django.");
      }
    }

    if (params.id !== undefined && params.lessonId !== undefined) {
      load();
    }
  }, [params.id, params.lessonId, router]);

  if (!isAuthorized || !course || !lesson) {
    return <LoadingScreen text="Validando seu acesso à aula..." />;
  }

  const lessonIndex = lesson.index;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden">
      <Header />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        <div className="flex-1 flex flex-col overflow-hidden">

          <VideoPlayer
            lesson={lesson}
            onToggleAI={() => setAiOpen(!aiOpen)}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar">
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
            />
          </div>
        </div>

        {aiOpen && (
          <AIChatPanel
            lessonTitle={lesson.title}
            lessonId={lessonId} 
            onClose={() => setAiOpen(false)}
          />
        )}
      </div>
    </div>
  );
}