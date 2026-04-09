"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import CourseGrid from "@/app/descobrir/CourseGrid";
import CategoryFilters from "@/app/descobrir/CategoryFilters";
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
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="py-12">
        <div className="container mx-auto px-6">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#2F52E0] p-2 rounded-lg shadow-lg shadow-blue-100">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#161B1D]">Cursos recomendados</h1>
          </div>

          <CategoryFilters 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelect={setActiveCategory} 
          />

          {activeCategory ? (
            <div className="animate-in fade-in duration-500">
              <CourseGrid courses={filteredCourses} />
            </div>
          ) : (
            <div className="space-y-16">
              {coursesByCategory.map((cat) => (
                <section key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#161B1D] flex items-center gap-2">
                      <span className="text-2xl">{cat.icon}</span> {cat.label}
                    </h2>
                    <button
                      className="text-[#2F52E0] text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      Mostrar mais <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <CourseGrid courses={cat.courses.slice(0, 4)} />
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}