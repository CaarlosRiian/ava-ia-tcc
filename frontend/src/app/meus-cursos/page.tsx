"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import { BookOpen } from "lucide-react";
import { getMyCourses } from "@/services/courses";
import LoadingScreen from "@/components/LoadingScreen";

type Course = {
  course_id: number;
  title: string;
  thumbnail: string;
  professor: string;
  progress: number;
};

export default function MeusCursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#161B1D] mb-2">
            Meus Cursos
          </h1>
          <p className="text-gray-500 font-light text-lg">
            Continue de onde parou seu aprendizado
          </p>
        </div>

        {loading ? (
          <LoadingScreen text="Carregando meus cursos..." />
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.course_id}
                id={course.course_id}
                title={course.title}
                author={course.professor}
                hours={0} 
                progress={course.progress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-gray-200 shadow-sm">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-[#2F52E0] w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-[#161B1D] mb-2">
              Nenhum curso por aqui...
            </h2>
            <p className="text-gray-400 mb-8 font-light max-w-sm mx-auto">
              Parece que você ainda não começou nenhum curso.
            </p>
            <Link href="/explorar">
              <button className="px-8 py-3 bg-[#2F52E0] text-white rounded-xl font-bold cursor-pointer">
                Explorar Cursos
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}