"use client";

import { useRecommendedCourses } from "../hooks/useRecommendedCourses";
import CourseCard from "./CourseCard";

export function RecommendedCourses() {
  const { courses, loading, error, isEmpty } = useRecommendedCourses();

  if (loading) {
    return (
      <section className="py-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Recomendados para Você
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="min-w-[280px] max-w-[280px] h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) return null;

  if (isEmpty) {
    return (
      <section className="py-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          Recomendados para Você
        </h2>
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 text-gray-500 text-sm">
          Nenhum curso recomendado encontrado para o seu perfil no momento. Atualize suas áreas de interesse e data de nascimento no perfil!
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Recomendados para Você
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-thin">
        {courses.map((course) => (
          <div key={course.id} className="min-w-[280px] max-w-[280px] snap-start">
            <CourseCard 
              id={course.id}
              title={course.title}
              author={course.professor}
              thumbnail={course.thumbnail || undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}