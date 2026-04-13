import Link from "next/link";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import { mockCourses } from "@/data/courses";
import { BookOpen } from "lucide-react";

export default function MeusCursos() {
  const myCourses = mockCourses.slice(0, 3);
  
  const progressList = [35, 72, 10];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#161B1D] mb-2">Meus Cursos</h1>
          <p className="text-gray-500 font-light text-lg">Continue de onde parou seu aprendizado</p>
        </div>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {myCourses.map((course, i) => (
              <CourseCard
                key={course.id}
                title={course.title}
                author={course.author}
                hours={course.hours}
                progress={progressList[i]} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <BookOpen className="text-[#2F52E0] w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-[#161B1D] mb-2">Nenhum curso por aqui...</h2>
            <p className="text-gray-400 mb-8 font-light max-w-sm mx-auto">
              Parece que você ainda não começou nenhum curso. Que tal explorar nossa biblioteca?
            </p>
            <Link href="/explorar">
              <button className="px-8 py-3 bg-[#2F52E0] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                Explorar Cursos
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}