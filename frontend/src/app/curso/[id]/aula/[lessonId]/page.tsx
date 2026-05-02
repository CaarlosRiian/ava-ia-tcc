"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import VideoPlayer from "./VideoPlayer";
import LessonContent from "./LessonContent";
import AIChatPanel from "./AIChatPanel";
import { getCourseDetail } from "@/services/courses";

export default function Aula() {
  const params = useParams();
  const courseId = Number(params.id);
  const lessonId = Number(params.lessonId);

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourseDetail(courseId);

        const allLessons =
          data.modules?.flatMap((m: any) => m.lessons) || [];

        const currentLesson = allLessons.find(
          (l: any) => l.id === lessonId
        );

        const index = allLessons.findIndex(
          (l: any) => l.id === lessonId
        );

        setCourse({
          ...data,
          lessons: allLessons,
        });

        setLesson({
          ...currentLesson,
          index,
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (courseId && lessonId) load();
  }, [courseId, lessonId]);

  if (!course || !lesson) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          Carregando aula...
        </div>
      </div>
    );
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
            onClose={() => setAiOpen(false)}
          />
        )}
      </div>
    </div>
  );
}