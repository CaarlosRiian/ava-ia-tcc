"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { mockCourses } from "@/data/courses";
import Header from "@/components/Header";
import VideoPlayer from "./VideoPlayer";
import LessonContent from "./LessonContent";
import AIChatPanel from "./AIChatPanel";

export default function Aula() {
  const params = useParams();
  const courseId = Number(params.id);
  const lessonId = params.lessonId;

  const [aiOpen, setAiOpen] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(true);

  const course = mockCourses.find((c) => c.id === courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const lessonIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? 0;

  if (!course || !lesson) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 font-medium">Aula não encontrada.</p>
          <Link 
            href="/explorar" 
            className="px-6 py-2 bg-[#2F52E0] text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
          >
            Voltar para Explorar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Header />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        <div className="flex-1 flex flex-col overflow-hidden">
          
          <VideoPlayer onToggleAI={() => setAiOpen(!aiOpen)} />
          
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