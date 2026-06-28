"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import Breadcrumb from "@/components/BreadCrumb";
import { BookOpen, Award, CheckCircle, GraduationCap } from "lucide-react";
import { getMyCourses } from "@/services/courses";
import LoadingScreen from "@/components/LoadingScreen";
import { formatName } from "@/utils/formatName"; 

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

  const totalInAndamento = courses.filter(c => c.progress < 100).length;
  const totalConcluidos = courses.filter(c => c.progress === 100).length;
  const totalCertificados = totalConcluidos; 

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <Breadcrumb items={[{ label: "Meus Cursos" }]} />

      <main className="container mx-auto px-6 pt-6 pb-12">
        
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-top-3 duration-500">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-3.5 rounded-xl text-[#2F52E0]">
                  <BookOpen size={22} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Em Andamento</span>
                  <span className="text-2xl font-black text-gray-800">
                    {totalInAndamento} {totalInAndamento === 1 ? 'curso' : 'cursos'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-500">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Concluídos</span>
                  <span className="text-2xl font-black text-gray-800">
                    {totalConcluidos} {totalConcluidos === 1 ? 'curso' : 'cursos'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
                <div className="bg-amber-50 p-3.5 rounded-xl text-amber-500">
                  <Award size={22} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Certificados</span>
                  <span className="text-2xl font-black text-gray-800">
                    {totalCertificados > 0 ? `${totalCertificados} emitidos` : 'Nenhum emitido'}
                  </span>
                </div>
              </div>

            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="text-gray-400 h-5 w-5" />
                <h2 className="text-lg font-bold text-gray-700">Sua Grade de Estudos</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {courses.map((course) => (
                  <CourseCard
                    key={course.course_id}
                    id={course.course_id}
                    title={course.title}
                    author={formatName(course.professor)} 
                    lessonsCount={undefined} 
                    progress={course.progress}
                    thumbnail={course.thumbnail} 
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm">
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
              <button className="px-8 py-3 bg-[#2F52E0] text-white rounded-xl font-bold transition-all hover:bg-blue-700 shadow-md cursor-pointer">
                Explorar Cursos
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}