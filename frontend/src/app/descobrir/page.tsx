"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { mockCourses, categories } from "@/data/courses";

export default function Explorar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCourses = activeCategory
    ? mockCourses.filter((c) => c.category === activeCategory)
    : mockCourses;

  const coursesByCategory = categories
    .map((cat) => ({
      ...cat,
      courses: mockCourses.filter((c) => c.category === cat.id),
    }))
    .filter((cat) => cat.courses.length > 0);

  return (
    <main className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#2F52E0] p-2 rounded-lg">
                <Sparkles className="text-white h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#161B1D]">Cursos recomendados</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-6 py-2 rounded-full text-sm font-bold cursor-pointer transition-all ${
              activeCategory === null
                ? "bg-[#2F52E0] text-white shadow-lg shadow-blue-100"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 border-gray-300 rounded-full text-sm cursor-pointer font-bold transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? "bg-[#2F52E0] text-white shadow-lg shadow-blue-100"
                  : "bg-white text-gray-500 cursor-pointer border border-gray-100 hover:bg-gray-50"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {activeCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                author={course.author}
                hours={course.hours}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {coursesByCategory.map((cat) => (
              <section key={cat.id}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#161B1D] flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span> {cat.label}
                  </h2>
                  <button
                    className="text-[#2F52E0] text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4 cursor-pointer"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    Mostrar mais <ArrowRight className="h-4 w-4 cursor-pointer" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {cat.courses.slice(0, 4).map((course) => (
                    <CourseCard
                      key={course.id}
                      title={course.title}
                      author={course.author}
                      hours={course.hours}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}