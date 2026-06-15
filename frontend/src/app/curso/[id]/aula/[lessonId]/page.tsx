"use client";

import { useParams, useRouter } from "next/navigation";
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
  const [chatWidth, setChatWidth] = useState(400);

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

        const allLessons = data.modules?.flatMap((m: any) => m.lessons) || [];
        const currentLesson = allLessons.find((l: any) => Number(l.id) === lessonId);
        const index = allLessons.findIndex((l: any) => Number(l.id) === lessonId);

        if (currentLesson) {
          setCourse({ ...data, lessons: allLessons });
          setLesson({ ...currentLesson, index });
          setIsAuthorized(true);
        } else {
          console.warn(`Aula com ID ${lessonId} não encontrada.`);
        }
      } catch (err) {
        console.error("Erro na verificação de acesso à aula:", err);
        alert("Erro de conexão com o servidor backend. Verifique o terminal do Django.");
      }
    }

    if (params.id !== undefined && params.lessonId !== undefined) {
      load();
    }
  }, [params.id, params.lessonId, router, courseId, lessonId]);

  if (!isAuthorized || !course || !lesson) {
    return <LoadingScreen text="Validando seu acesso à aula..." />;
  }

  const lessonIndex = lesson.index;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden">
      <Header />

      <div className="flex flex-row flex-1 overflow-hidden w-full relative">

        <div className="flex-1 flex flex-col overflow-y-auto h-full items-center bg-gray-50 p-4 lg:p-6 custom-scrollbar">
          
          <div className="w-full max-w-5xl flex flex-col justify-start gap-6 pb-12">
            
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
            />

          </div>
        </div>

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